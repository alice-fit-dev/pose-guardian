import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

// MoveNet keypoint name → index mapping
const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

let detector = null;

export async function loadDetector() {
  if (detector) return detector;
  console.log('[PoseGuardian] MoveNet 모델 로딩 시작...');
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
  );
  console.log('[PoseGuardian] 모델 로딩 완료');
  return detector;
}

export async function detectPose(videoElement) {
  if (!detector) return null;
  const poses = await detector.estimatePoses(videoElement);
  if (!poses.length) return null;

  const kp = {};
  for (const keypoint of poses[0].keypoints) {
    const name = keypoint.name ?? KEYPOINT_NAMES[poses[0].keypoints.indexOf(keypoint)];
    kp[name] = {
      x: keypoint.x / videoElement.videoWidth,
      y: keypoint.y / videoElement.videoHeight,
      score: keypoint.score ?? 0,
    };
  }
  return { keypoints: kp, raw: poses[0].keypoints };
}
