import cv2


class Camera:
    def __init__(self, device: int = 0, width: int = 1280, height: int = 720, fps: int = 30):
        self._cap = cv2.VideoCapture(device)
        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        self._cap.set(cv2.CAP_PROP_FPS, fps)
        if not self._cap.isOpened():
            raise RuntimeError(f"Cannot open camera device {device}")

    def read(self) -> tuple[bool, cv2.typing.MatLike]:
        return self._cap.read()

    def release(self) -> None:
        self._cap.release()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.release()
