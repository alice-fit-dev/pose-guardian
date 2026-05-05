"""Shoulder safety rules for common weight training movements.

Each checker returns a list of Warning objects. An empty list means the
posture looks safe for that metric.
"""

from dataclasses import dataclass, field
from enum import Enum

from src.analysis.angles import joint_angle, midpoint
from src.pose.estimator import Keypoint, PoseResult

MIN_VISIBILITY = 0.5


class Severity(Enum):
    OK = "ok"
    WARN = "warn"
    DANGER = "danger"


@dataclass
class Warning:
    code: str
    message: str
    severity: Severity
    angle: float | None = None


@dataclass
class ShoulderReport:
    warnings: list[Warning] = field(default_factory=list)

    # Angles computed this frame (for UI display)
    left_shoulder_angle: float | None = None
    right_shoulder_angle: float | None = None
    left_elbow_angle: float | None = None
    right_elbow_angle: float | None = None
    torso_lean: float | None = None

    @property
    def is_safe(self) -> bool:
        return not any(w.severity == Severity.DANGER for w in self.warnings)

    @property
    def worst_severity(self) -> Severity:
        if any(w.severity == Severity.DANGER for w in self.warnings):
            return Severity.DANGER
        if any(w.severity == Severity.WARN for w in self.warnings):
            return Severity.WARN
        return Severity.OK


def _visible(*kps: Keypoint) -> bool:
    return all(k.visibility >= MIN_VISIBILITY for k in kps)


def analyze(result: PoseResult) -> ShoulderReport:
    kp = result.keypoints
    report = ShoulderReport()

    ls, rs = kp["left_shoulder"], kp["right_shoulder"]
    le, re = kp["left_elbow"], kp["right_elbow"]
    lw, rw = kp["left_wrist"], kp["right_wrist"]
    lh, rh = kp["left_hip"], kp["right_hip"]

    # --- Shoulder abduction angle (upper-arm vs torso) ---
    if _visible(lh, ls, le):
        angle = joint_angle(lh, ls, le)
        report.left_shoulder_angle = angle
        _check_shoulder_abduction(report, "left", angle)

    if _visible(rh, rs, re):
        angle = joint_angle(rh, rs, re)
        report.right_shoulder_angle = angle
        _check_shoulder_abduction(report, "right", angle)

    # --- Elbow flexion (90° rule for pressing movements) ---
    if _visible(ls, le, lw):
        angle = joint_angle(ls, le, lw)
        report.left_elbow_angle = angle
        _check_elbow_flare(report, "left", angle)

    if _visible(rs, re, rw):
        angle = joint_angle(rs, re, rw)
        report.right_elbow_angle = angle
        _check_elbow_flare(report, "right", angle)

    # --- Torso lean / shoulder symmetry ---
    if _visible(ls, rs, lh, rh):
        angle = _torso_lean_angle(ls, rs, lh, rh)
        report.torso_lean = angle
        _check_torso_symmetry(report, angle)

    return report


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def _check_shoulder_abduction(report: ShoulderReport, side: str, angle: float) -> None:
    # Shoulder impingement risk rises above ~90° abduction under load.
    # Above 150° (overhead) the risk zone shifts but doesn't disappear.
    if 85 <= angle <= 100:
        report.warnings.append(Warning(
            code=f"{side}_shoulder_impingement_zone",
            message=f"{side.capitalize()} shoulder in impingement zone ({angle:.0f}°). "
                    "Keep upper-arm slightly below horizontal or fully overhead.",
            severity=Severity.WARN,
            angle=angle,
        ))
    elif 100 < angle < 150:
        report.warnings.append(Warning(
            code=f"{side}_shoulder_overhead_transition",
            message=f"{side.capitalize()} shoulder at {angle:.0f}° — transitioning overhead. "
                    "Maintain scapular retraction.",
            severity=Severity.WARN,
            angle=angle,
        ))


def _check_elbow_flare(report: ShoulderReport, side: str, angle: float) -> None:
    # During bench/overhead press, elbow angle < 60° means extreme flare or
    # extreme tuck — both put stress on the AC joint or rotator cuff.
    if angle < 60:
        report.warnings.append(Warning(
            code=f"{side}_elbow_extreme",
            message=f"{side.capitalize()} elbow angle too acute ({angle:.0f}°). "
                    "Check grip width and elbow path.",
            severity=Severity.DANGER,
            angle=angle,
        ))
    elif angle < 75:
        report.warnings.append(Warning(
            code=f"{side}_elbow_narrow",
            message=f"{side.capitalize()} elbow angle narrow ({angle:.0f}°). "
                    "Widen grip or adjust elbow path.",
            severity=Severity.WARN,
            angle=angle,
        ))


def _torso_lean_angle(ls: Keypoint, rs: Keypoint, lh: Keypoint, rh: Keypoint) -> float:
    """Angle of the line connecting shoulder midpoint → hip midpoint vs vertical."""
    import numpy as np
    sm = midpoint(ls, rs)
    hm = midpoint(lh, rh)
    vec = np.array([sm.x - hm.x, sm.y - hm.y])
    vertical = np.array([0.0, -1.0])  # screen y is flipped
    norm = np.linalg.norm(vec)
    if norm < 1e-6:
        return 0.0
    cos_theta = np.clip(np.dot(vec / norm, vertical), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_theta)))


def _check_torso_symmetry(report: ShoulderReport, lean: float) -> None:
    if lean > 20:
        report.warnings.append(Warning(
            code="torso_excessive_lean",
            message=f"Excessive torso lean ({lean:.0f}°). "
                    "Unilateral shoulder loading risk — brace core.",
            severity=Severity.DANGER,
            angle=lean,
        ))
    elif lean > 10:
        report.warnings.append(Warning(
            code="torso_moderate_lean",
            message=f"Torso lean {lean:.0f}° — watch for compensation.",
            severity=Severity.WARN,
            angle=lean,
        ))
