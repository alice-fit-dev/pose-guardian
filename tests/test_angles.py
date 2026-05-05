import pytest
from src.pose.estimator import Keypoint
from src.analysis.angles import joint_angle


def kp(x, y) -> Keypoint:
    return Keypoint(x=x, y=y, z=0.0, visibility=1.0)


def test_right_angle():
    # A at top, vertex at origin, B at right → 90°
    assert abs(joint_angle(kp(0, -1), kp(0, 0), kp(1, 0)) - 90.0) < 0.01


def test_straight_line():
    assert abs(joint_angle(kp(-1, 0), kp(0, 0), kp(1, 0)) - 180.0) < 0.01


def test_zero_angle():
    # Same direction
    assert joint_angle(kp(1, 0), kp(0, 0), kp(1, 0)) < 0.01
