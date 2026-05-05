import numpy as np

from src.pose.estimator import Keypoint


def joint_angle(a: Keypoint, vertex: Keypoint, b: Keypoint) -> float:
    """Return the angle (degrees) at *vertex* formed by rays vertex→a and vertex→b.

    Uses only x/y to stay invariant to MediaPipe's depth noise.
    """
    va = np.array([a.x - vertex.x, a.y - vertex.y])
    vb = np.array([b.x - vertex.x, b.y - vertex.y])
    norm_a, norm_b = np.linalg.norm(va), np.linalg.norm(vb)
    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0
    cos_theta = np.clip(np.dot(va, vb) / (norm_a * norm_b), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_theta)))


def midpoint(a: Keypoint, b: Keypoint) -> Keypoint:
    from src.pose.estimator import Keypoint as KP
    return KP(
        x=(a.x + b.x) / 2,
        y=(a.y + b.y) / 2,
        z=(a.z + b.z) / 2,
        visibility=min(a.visibility, b.visibility),
    )
