from dataclasses import dataclass
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

_BaseOptions = mp.tasks.BaseOptions
_PoseLandmarker = mp.tasks.vision.PoseLandmarker
_PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
_RunningMode = mp.tasks.vision.RunningMode
_PoseLandmark = mp.tasks.vision.PoseLandmark
_Connections = mp.tasks.vision.PoseLandmarksConnections

DEFAULT_MODEL = Path(__file__).parent.parent.parent / "models" / "pose_landmarker_full.task"

# Body-part landmark indices (mirrors legacy PoseLandmark enum values)
LANDMARK_INDEX = {
    "nose":           _PoseLandmark.NOSE.value,
    "left_shoulder":  _PoseLandmark.LEFT_SHOULDER.value,
    "right_shoulder": _PoseLandmark.RIGHT_SHOULDER.value,
    "left_elbow":     _PoseLandmark.LEFT_ELBOW.value,
    "right_elbow":    _PoseLandmark.RIGHT_ELBOW.value,
    "left_wrist":     _PoseLandmark.LEFT_WRIST.value,
    "right_wrist":    _PoseLandmark.RIGHT_WRIST.value,
    "left_hip":       _PoseLandmark.LEFT_HIP.value,
    "right_hip":      _PoseLandmark.RIGHT_HIP.value,
    "left_knee":      _PoseLandmark.LEFT_KNEE.value,
    "right_knee":     _PoseLandmark.RIGHT_KNEE.value,
}

# Drawing colors (BGR)
_LANDMARK_COLOR = (0, 255, 0)
_CONNECTION_COLOR = (255, 255, 255)


@dataclass(frozen=True)
class Keypoint:
    x: float  # normalized [0, 1]
    y: float
    z: float
    visibility: float

    def as_array(self) -> np.ndarray:
        return np.array([self.x, self.y, self.z])


@dataclass
class PoseResult:
    keypoints: dict[str, Keypoint]
    annotated_frame: np.ndarray


class PoseEstimator:
    def __init__(
        self,
        model_path: Path = DEFAULT_MODEL,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
    ):
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found: {model_path}\n"
                "Run:  python scripts/download_model.py"
            )
        options = _PoseLandmarkerOptions(
            base_options=_BaseOptions(model_asset_path=str(model_path)),
            running_mode=_RunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=min_detection_confidence,
            min_pose_presence_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        self._landmarker = _PoseLandmarker.create_from_options(options)
        self._ts_ms: int = 0  # monotonically increasing timestamp

    def process(self, frame: np.ndarray) -> PoseResult | None:
        self._ts_ms += 33  # ~30 fps; must be strictly increasing
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = self._landmarker.detect_for_video(mp_image, self._ts_ms)

        if not result.pose_landmarks:
            return None

        landmarks = result.pose_landmarks[0]
        keypoints = {
            name: Keypoint(
                x=landmarks[idx].x,
                y=landmarks[idx].y,
                z=landmarks[idx].z,
                visibility=landmarks[idx].visibility,
            )
            for name, idx in LANDMARK_INDEX.items()
        }

        annotated = _draw_skeleton(frame.copy(), landmarks)
        return PoseResult(keypoints=keypoints, annotated_frame=annotated)

    def close(self) -> None:
        self._landmarker.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()


def _draw_skeleton(frame: np.ndarray, landmarks: list) -> np.ndarray:
    h, w = frame.shape[:2]

    # Connections
    for conn in _Connections.POSE_LANDMARKS:
        a, b = landmarks[conn.start], landmarks[conn.end]
        if a.visibility < 0.5 or b.visibility < 0.5:
            continue
        pt1 = (int(a.x * w), int(a.y * h))
        pt2 = (int(b.x * w), int(b.y * h))
        cv2.line(frame, pt1, pt2, _CONNECTION_COLOR, 2, cv2.LINE_AA)

    # Keypoints
    for lm in landmarks:
        if lm.visibility < 0.5:
            continue
        cx, cy = int(lm.x * w), int(lm.y * h)
        cv2.circle(frame, (cx, cy), 4, _LANDMARK_COLOR, -1, cv2.LINE_AA)

    return frame
