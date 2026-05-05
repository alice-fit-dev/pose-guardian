/**
 * Returns the angle (degrees) at vertex formed by rays vertex→a and vertex→b.
 * Uses only x/y to stay invariant to depth noise.
 */
export function jointAngle(a, vertex, b) {
  const va = [a.x - vertex.x, a.y - vertex.y];
  const vb = [b.x - vertex.x, b.y - vertex.y];
  const normA = Math.hypot(...va);
  const normB = Math.hypot(...vb);
  if (normA < 1e-6 || normB < 1e-6) return 0;
  const dot = va[0] * vb[0] + va[1] * vb[1];
  const cos = Math.max(-1, Math.min(1, dot / (normA * normB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score ?? 1, b.score ?? 1),
  };
}
