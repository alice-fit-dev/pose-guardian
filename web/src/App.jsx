import { useEffect, useRef, useState, useCallback } from 'react';
import { loadDetector, detectPose } from './pose/estimator';
import { analyzeSquat } from './analysis/squat';
import { analyzeDeadlift } from './analysis/deadlift';
import { analyzeBench } from './analysis/bench';
import ExerciseSelector from './components/ExerciseSelector';
import PoseOverlay from './components/PoseOverlay';
import FeedbackPanel from './components/FeedbackPanel';

const ANALYZERS = { squat: analyzeSquat, deadlift: analyzeDeadlift, bench: analyzeBench };

export default function App() {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const [exercise, setExercise] = useState('squat');
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [result, setResult] = useState({ warnings: [], angles: {}, keypoints: null });
  const [videoDim, setVideoDim] = useState({ w: 640, h: 480 });

  useEffect(() => {
    loadDetector().then(() => setReady(true));
  }, []);

  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setVideoDim({ w: videoRef.current.videoWidth, h: videoRef.current.videoHeight });
      } catch (e) {
        setCameraError(e.message);
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const loop = useCallback(async () => {
    const video = videoRef.current;
    if (ready && video && video.readyState >= 2) {
      const pose = await detectPose(video);
      if (pose) {
        const { warnings, angles } = ANALYZERS[exercise](pose.keypoints);
        setResult({ warnings, angles, keypoints: pose.keypoints });
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [ready, exercise]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Pose Guardian</h1>
      </div>

      <ExerciseSelector selected={exercise} onChange={setExercise} />

      <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', background: '#000' }}>
        <video
          ref={videoRef}
          style={{ width: videoDim.w, height: videoDim.h, display: 'block' }}
          playsInline
          muted
        />
        {result.keypoints && (
          <PoseOverlay keypoints={result.keypoints} width={videoDim.w} height={videoDim.h} />
        )}
        {!ready && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#aaa' }}>
            모델 로딩 중...
          </div>
        )}
        {cameraError && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#f44336', textAlign: 'center' }}>
            카메라 없음<br /><small>{cameraError}</small>
          </div>
        )}
      </div>

      <FeedbackPanel warnings={result.warnings} angles={result.angles} />
    </div>
  );
}
