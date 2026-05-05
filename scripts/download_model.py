"""Download the MediaPipe PoseLandmarker model to models/."""
import urllib.request
from pathlib import Path

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
)
MODEL_PATH = Path(__file__).parent.parent / "models" / "pose_landmarker_full.task"


def download() -> None:
    if MODEL_PATH.exists():
        print(f"Model already present: {MODEL_PATH}")
        return
    print(f"Downloading pose landmarker model → {MODEL_PATH}")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print(f"Done ({MODEL_PATH.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    download()
