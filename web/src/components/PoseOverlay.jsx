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

export default function PoseOverlay({ keypoints }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !keypoints) return;

    // 실제 렌더된 크기로 맞춤
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      const kpA = keypoints[a], kpB = keypoints[b];
      if (!kpA || !kpB) continue;
      if ((kpA.score ?? 0) < MIN_SCORE || (kpB.score ?? 0) < MIN_SCORE) continue;
      ctx.beginPath();
      ctx.moveTo(kpA.x * w, kpA.y * h);
      ctx.lineTo(kpB.x * w, kpB.y * h);
      ctx.stroke();
    }

    for (const kp of Object.values(keypoints)) {
      if ((kp.score ?? 0) < MIN_SCORE) continue;
      ctx.beginPath();
      ctx.arc(kp.x * w, kp.y * h, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#4f8ef7';
      ctx.fill();
    }
  }, [keypoints]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
