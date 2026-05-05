import { jointAngle, midpoint } from './angles';

const MIN_SCORE = 0.3;

function visible(...kps) {
  return kps.every(k => (k?.score ?? 0) >= MIN_SCORE);
}

export function analyzeSquat(kp) {
  const warnings = [];
  const angles = {};

  const ls = kp.left_shoulder, rs = kp.right_shoulder;
  const lh = kp.left_hip,      rh = kp.right_hip;
  const lk = kp.left_knee,     rk = kp.right_knee;
  const la = kp.left_ankle,    ra = kp.right_ankle;

  // 무릎 굽힘 각도 (hip-knee-ankle)
  if (visible(lh, lk, la)) {
    angles.leftKnee = jointAngle(lh, lk, la);
  }
  if (visible(rh, rk, ra)) {
    angles.rightKnee = jointAngle(rh, rk, ra);
  }

  // 무릎 깊이 체크 (90° 미만 = 패럴렐 이하)
  if (angles.leftKnee !== undefined && angles.leftKnee > 100) {
    warnings.push({ code: 'squat_depth', severity: 'warn', message: '스쿼트 깊이가 얕아요. 허벅지가 지면과 평행 이하로 내려가야 해요.' });
  }

  // 무릎 안쪽 무너짐 (knee valgus) — 무릎 x가 발목보다 안쪽
  if (visible(lk, la) && lk.x > la.x + 0.03) {
    warnings.push({ code: 'left_knee_valgus', severity: 'danger', message: '왼쪽 무릎이 안으로 무너지고 있어요 (니인). 발끝 방향으로 무릎을 밀어내세요.' });
  }
  if (visible(rk, ra) && rk.x < ra.x - 0.03) {
    warnings.push({ code: 'right_knee_valgus', severity: 'danger', message: '오른쪽 무릎이 안으로 무너지고 있어요 (니인). 발끝 방향으로 무릎을 밀어내세요.' });
  }

  // 몸통 과도한 앞쏠림 (torso lean)
  if (visible(ls, rs, lh, rh)) {
    const sm = midpoint(ls, rs);
    const hm = midpoint(lh, rh);
    const vec = [sm.x - hm.x, sm.y - hm.y];
    const norm = Math.hypot(...vec);
    if (norm > 1e-6) {
      const lean = (Math.acos(Math.max(-1, Math.min(1, -vec[1] / norm))) * 180) / Math.PI;
      angles.torsoLean = lean;
      if (lean > 45) {
        warnings.push({ code: 'squat_excessive_lean', severity: 'warn', message: `상체가 ${lean.toFixed(0)}° 앞으로 쏠려 있어요. 코어를 조이고 가슴을 세우세요.` });
      }
    }
  }

  return { warnings, angles };
}
