import { useEffect, useRef } from 'react';

const CONNECTIONS = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
];

const MIN_SCORE = 0.3;

export default function PoseOverlay({ keypoints, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !keypoints) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Connections
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      const kpA = keypoints[a], kpB = keypoints[b];
      if (!kpA || !kpB) continue;
      if ((kpA.score ?? 0) < MIN_SCORE || (kpB.score ?? 0) < MIN_SCORE) continue;
      ctx.beginPath();
      ctx.moveTo(kpA.x * width, kpA.y * height);
      ctx.lineTo(kpB.x * width, kpB.y * height);
      ctx.stroke();
    }

    // Keypoints
    for (const kp of Object.values(keypoints)) {
      if ((kp.score ?? 0) < MIN_SCORE) continue;
      ctx.beginPath();
      ctx.arc(kp.x * width, kp.y * height, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#4f8ef7';
      ctx.fill();
    }
  }, [keypoints, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    />
  );
}
