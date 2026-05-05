import sys

import cv2

from src.analysis.shoulder import analyze
from src.capture.camera import Camera
from src.feedback.overlay import draw_report
from src.pose.estimator import PoseEstimator


def main() -> None:
    print("Pose Guardian — press Q to quit, S to save screenshot")

    with Camera(device=0) as cam, PoseEstimator(model_complexity=1) as estimator:
        while True:
            ok, frame = cam.read()
            if not ok:
                print("Frame capture failed", file=sys.stderr)
                break

            result = estimator.process(frame)

            if result is not None:
                report = analyze(result)
                display = draw_report(result.annotated_frame, report)
            else:
                display = frame
                cv2.putText(
                    display, "No pose detected", (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 220), 2,
                )

            cv2.imshow("Pose Guardian", display)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break
            if key == ord("s"):
                path = "screenshot.jpg"
                cv2.imwrite(path, display)
                print(f"Saved {path}")

    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
