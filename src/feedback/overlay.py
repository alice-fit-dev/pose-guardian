"""Draw analysis results onto the video frame."""

import cv2
import numpy as np

from src.analysis.shoulder import Severity, ShoulderReport

_COLOR = {
    Severity.OK: (0, 200, 0),       # green
    Severity.WARN: (0, 165, 255),    # orange
    Severity.DANGER: (0, 0, 220),    # red
}

_FONT = cv2.FONT_HERSHEY_SIMPLEX


def draw_report(frame: cv2.typing.MatLike, report: ShoulderReport) -> cv2.typing.MatLike:
    h, w = frame.shape[:2]
    color = _COLOR[report.worst_severity]

    # Status banner
    label = report.worst_severity.value.upper()
    cv2.rectangle(frame, (0, 0), (w, 40), (*color[::-1], 180), -1)  # BGR
    cv2.putText(frame, label, (10, 28), _FONT, 0.9, (255, 255, 255), 2, cv2.LINE_AA)

    # Angle readouts (top-right)
    angles = [
        ("L Shoulder", report.left_shoulder_angle),
        ("R Shoulder", report.right_shoulder_angle),
        ("L Elbow", report.left_elbow_angle),
        ("R Elbow", report.right_elbow_angle),
        ("Torso", report.torso_lean),
    ]
    for i, (name, val) in enumerate(angles):
        if val is None:
            continue
        text = f"{name}: {val:.0f}°"
        cv2.putText(frame, text, (w - 220, 30 + i * 26), _FONT, 0.6, (220, 220, 220), 1, cv2.LINE_AA)

    # Warning messages (bottom panel)
    if report.warnings:
        panel_h = len(report.warnings) * 28 + 12
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, h - panel_h), (w, h), (20, 20, 20), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        for i, warning in enumerate(report.warnings):
            wcolor = _COLOR[warning.severity]
            cv2.putText(
                frame,
                f"  {warning.message}",
                (8, h - panel_h + 22 + i * 28),
                _FONT, 0.52, wcolor, 1, cv2.LINE_AA,
            )

    return frame
