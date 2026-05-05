import pytest
from unittest.mock import MagicMock
from src.analysis.shoulder import analyze, Severity
from src.pose.estimator import Keypoint, PoseResult


def kp(x, y, vis=1.0) -> Keypoint:
    return Keypoint(x=x, y=y, z=0.0, visibility=vis)


def make_result(**overrides) -> PoseResult:
    # Neutral upright T-pose-ish keypoints (normalized coords)
    defaults = {
        "nose":           kp(0.50, 0.05),
        "left_shoulder":  kp(0.35, 0.25),
        "right_shoulder": kp(0.65, 0.25),
        "left_elbow":     kp(0.35, 0.45),   # arms hanging down
        "right_elbow":    kp(0.65, 0.45),
        "left_wrist":     kp(0.35, 0.62),
        "right_wrist":    kp(0.65, 0.62),
        "left_hip":       kp(0.40, 0.60),
        "right_hip":      kp(0.60, 0.60),
        "left_knee":      kp(0.40, 0.85),
        "right_knee":     kp(0.60, 0.85),
    }
    defaults.update(overrides)
    return PoseResult(keypoints=defaults, annotated_frame=MagicMock())


def test_neutral_pose_is_safe():
    report = analyze(make_result())
    assert report.worst_severity == Severity.OK


def test_impingement_zone_triggers_warn():
    # Place elbow directly lateral — shoulder abduction ~90°
    result = make_result(
        left_elbow=kp(0.10, 0.25),   # same height as shoulder → ~90° abduction
        left_shoulder=kp(0.35, 0.25),
        left_hip=kp(0.35, 0.60),
    )
    report = analyze(result)
    codes = [w.code for w in report.warnings]
    assert any("impingement" in c for c in codes)


def test_extreme_torso_lean_is_danger():
    # Shift shoulders far to one side
    result = make_result(
        left_shoulder=kp(0.10, 0.25),
        right_shoulder=kp(0.40, 0.25),
        left_hip=kp(0.40, 0.60),
        right_hip=kp(0.60, 0.60),
    )
    report = analyze(result)
    assert report.worst_severity == Severity.DANGER
