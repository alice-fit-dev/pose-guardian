import { useEffect, useRef, useState, useCallback } from 'react';
import { loadDetector, detectPose } from './pose/estimator';
import { analyzeSquat } from './analysis/squat';
import { analyzeDeadlift } from './analysis/deadlift';
import { analyzeBench } from './analysis/bench';
import ExerciseSelector from './components/ExerciseSelector';
import PoseOverlay from './components/PoseOverlay';
import FeedbackPanel from './components/FeedbackPanel';

const ANALYZERS = { squat: analyzeSquat, deadlift: analyzeDeadlift, bench: analyzeBench };
const TTS_COOLDOWN_MS = 8000;

export default function App() {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastSpokenRef = useRef({ text: '', time: 0 });

  const [exercise, setExercise] = useState('squat');
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [result, setResult] = useState({ warnings: [], angles: {}, keypoints: null });
  const [videoDim, setVideoDim] = useState({ w: 640, h: 480 });
  const [mode, setMode] = useState('camera'); // 'camera' | 'file'
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    loadDetector().then(() => setReady(true));
  }, []);

  // 카메라 모드
  useEffect(() => {
    if (mode !== 'camera') return;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoRef.current.srcObject = stream;
        videoRef.current.src = '';
        await videoRef.current.play();
        setVideoDim({ w: videoRef.current.videoWidth, h: videoRef.current.videoHeight });
        setCameraError(null);
      } catch (e) {
        setCameraError(e.message);
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [mode]);

  // 파일 모드
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    video.srcObject = null;
    video.src = url;
    video.loop = true;
    video.play().then(() => {
      setVideoDim({ w: video.videoWidth || 640, h: video.videoHeight || 480 });
    });
    setMode('file');
  }

  // TTS
  function speak(code, text) {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const now = Date.now();
    if (code === lastSpokenRef.current.text && now - lastSpokenRef.current.time < TTS_COOLDOWN_MS) return;
    lastSpokenRef.current = { text: code, time: now };
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ko-KR';
    utt.rate = 1.0;
    window.speechSynthesis.speak(utt);
  }

  // 감지 루프
  const loop = useCallback(async () => {
    const video = videoRef.current;
    if (ready && video && video.readyState >= 2) {
      const pose = await detectPose(video);
      if (pose) {
        const { warnings, angles } = ANALYZERS[exercise](pose.keypoints);
        setResult({ warnings, angles, keypoints: pose.keypoints });

        // 콘솔 로그
        const angleStr = Object.entries(angles).map(([k, v]) => `${k}:${v.toFixed(0)}°`).join(' ');
        if (angleStr) console.log(`[각도] ${angleStr}`);

        // TTS — 가장 심각한 경고 하나만
        const danger = warnings.find(w => w.severity === 'danger') ?? warnings[0];
        if (danger) speak(danger.code, danger.message);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [ready, exercise, ttsEnabled]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, flex: 1 }}>Pose Guardian</h1>
        <button
          onClick={() => setTtsEnabled(v => !v)}
          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: ttsEnabled ? '#4f8ef7' : '#333', color: '#fff', cursor: 'pointer', fontSize: 13 }}
        >
          {ttsEnabled ? '🔊 음성 ON' : '🔇 음성 OFF'}
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 13 }}
        >
          📁 영상 업로드
        </button>
        {mode === 'file' && (
          <button
            onClick={() => setMode('camera')}
            style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontSize: 13 }}
          >
            📷 카메라
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      <ExerciseSelector selected={exercise} onChange={setExercise} />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#000' }}>
        <div style={{ position: 'relative', width: videoDim.w, height: videoDim.h }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
            playsInline
            muted
          />
          {result.keypoints && <PoseOverlay keypoints={result.keypoints} />}
          {!ready && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#aaa' }}>
              모델 로딩 중...
            </div>
          )}
          {cameraError && mode === 'camera' && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#f44336', textAlign: 'center' }}>
              카메라 없음<br /><small>{cameraError}</small>
            </div>
          )}
        </div>
      </div>

      <FeedbackPanel warnings={result.warnings} angles={result.angles} />
    </div>
  );
}
