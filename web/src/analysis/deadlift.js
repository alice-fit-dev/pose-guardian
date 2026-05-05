import { jointAngle, midpoint } from './angles';

const MIN_SCORE = 0.3;

function visible(...kps) {
  return kps.every(k => (k?.score ?? 0) >= MIN_SCORE);
}

export function analyzeDeadlift(kp) {
  const warnings = [];
  const angles = {};

  const ls = kp.left_shoulder, rs = kp.right_shoulder;
  const lh = kp.left_hip,      rh = kp.right_hip;
  const lk = kp.left_knee,     rk = kp.right_knee;
  const la = kp.left_ankle,    ra = kp.right_ankle;

  // 허리 굽힘 — 어깨 중점에서 힙 중점까지 수직 대비 각도
  if (visible(ls, rs, lh, rh)) {
    const sm = midpoint(ls, rs);
    const hm = midpoint(lh, rh);
    const vec = [sm.x - hm.x, sm.y - hm.y];
    const norm = Math.hypot(...vec);
    if (norm > 1e-6) {
      const backAngle = (Math.acos(Math.max(-1, Math.min(1, -vec[1] / norm))) * 180) / Math.PI;
      angles.backAngle = backAngle;
      if (backAngle > 50) {
        warnings.push({ code: 'deadlift_back_round', severity: 'danger', message: `허리가 ${backAngle.toFixed(0)}° 굽어있어요. 척추 중립을 유지하고 코어를 강하게 잠그세요.` });
      } else if (backAngle > 35) {
        warnings.push({ code: 'deadlift_back_warn', severity: 'warn', message: `허리 각도 ${backAngle.toFixed(0)}° — 등이 라운딩되지 않도록 주의하세요.` });
      }
    }
  }

  // 힙 힌지 — 힙이 무릎보다 위에 있어야 함 (리프트 시작 포지션)
  if (visible(lh, lk, la)) {
    angles.leftHip = jointAngle(ls ?? lh, lh, lk);
  }
  if (visible(rh, rk, ra)) {
    angles.rightHip = jointAngle(rs ?? rh, rh, rk);
  }

  // 어깨가 바벨(손목) 앞으로 너무 나옴 — 어깨 x가 손목 x보다 앞
  const lw = kp.left_wrist, rw = kp.right_wrist;
  if (visible(ls, lw) && ls.x < lw.x - 0.05) {
    warnings.push({ code: 'shoulder_over_bar', severity: 'warn', message: '어깨가 바벨 앞으로 너무 나왔어요. 어깨를 바벨 바로 위에 위치시키세요.' });
  }

  return { warnings, angles };
}
