import { jointAngle, midpoint } from './angles';

const MIN_SCORE = 0.3;

function visible(...kps) {
  return kps.every(k => (k?.score ?? 0) >= MIN_SCORE);
}

export function analyzeBench(kp) {
  const warnings = [];
  const angles = {};

  const ls = kp.left_shoulder, rs = kp.right_shoulder;
  const le = kp.left_elbow,    re = kp.right_elbow;
  const lw = kp.left_wrist,    rw = kp.right_wrist;
  const lh = kp.left_hip,      rh = kp.right_hip;

  // 팔꿈치 각도 (shoulder-elbow-wrist)
  if (visible(ls, le, lw)) {
    angles.leftElbow = jointAngle(ls, le, lw);
    if (angles.leftElbow < 60) {
      warnings.push({ code: 'left_elbow_extreme', severity: 'danger', message: `왼쪽 팔꿈치 각도 ${angles.leftElbow.toFixed(0)}° — 너무 좁아요. 그립 너비를 조정하세요.` });
    }
  }
  if (visible(rs, re, rw)) {
    angles.rightElbow = jointAngle(rs, re, rw);
    if (angles.rightElbow < 60) {
      warnings.push({ code: 'right_elbow_extreme', severity: 'danger', message: `오른쪽 팔꿈치 각도 ${angles.rightElbow.toFixed(0)}° — 너무 좁아요. 그립 너비를 조정하세요.` });
    }
  }

  // 어깨 외전 (hip-shoulder-elbow) — 임핀지먼트 존 체크
  if (visible(lh, ls, le)) {
    angles.leftShoulder = jointAngle(lh, ls, le);
    if (angles.leftShoulder >= 85 && angles.leftShoulder <= 100) {
      warnings.push({ code: 'left_shoulder_impingement', severity: 'warn', message: `왼쪽 어깨 ${angles.leftShoulder.toFixed(0)}° — 임핀지먼트 위험 구간이에요. 팔꿈치를 약간 내려주세요.` });
    }
  }
  if (visible(rh, rs, re)) {
    angles.rightShoulder = jointAngle(rh, rs, re);
    if (angles.rightShoulder >= 85 && angles.rightShoulder <= 100) {
      warnings.push({ code: 'right_shoulder_impingement', severity: 'warn', message: `오른쪽 어깨 ${angles.rightShoulder.toFixed(0)}° — 임핀지먼트 위험 구간이에요. 팔꿈치를 약간 내려주세요.` });
    }
  }

  // 좌우 팔꿈치 비대칭
  if (angles.leftElbow !== undefined && angles.rightElbow !== undefined) {
    const diff = Math.abs(angles.leftElbow - angles.rightElbow);
    if (diff > 15) {
      warnings.push({ code: 'elbow_asymmetry', severity: 'warn', message: `팔꿈치 좌우 비대칭 ${diff.toFixed(0)}° — 그립이 중앙에 있는지 확인하세요.` });
    }
  }

  return { warnings, angles };
}
