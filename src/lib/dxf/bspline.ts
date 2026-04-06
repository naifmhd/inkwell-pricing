import type { DxfPoint, DxfEntity } from './types';

function findKnotSpan(degree: number, t: number, knots: number[]): number {
  const n = knots.length - degree - 2;
  if (t >= knots[n + 1]) return n;
  if (t <= knots[degree]) return degree;
  let low = degree, high = n + 1;
  let mid = Math.floor((low + high) / 2);
  while (t < knots[mid] || t >= knots[mid + 1]) {
    if (t < knots[mid]) high = mid;
    else low = mid;
    mid = Math.floor((low + high) / 2);
  }
  return mid;
}

function deBoor(
  degree: number,
  knots: number[],
  controlPoints: DxfPoint[],
  t: number,
): { x: number; y: number } {
  const span = findKnotSpan(degree, t, knots);
  const d: { x: number; y: number }[] = [];
  for (let j = 0; j <= degree; j++) {
    const cp = controlPoints[span - degree + j];
    d.push({ x: cp.x, y: cp.y });
  }
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = span - degree + j;
      const denom = knots[i + degree - r + 1] - knots[i];
      const alpha = denom === 0 ? 0 : (t - knots[i]) / denom;
      d[j] = {
        x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
        y: (1 - alpha) * d[j - 1].y + alpha * d[j].y,
      };
    }
  }
  return d[degree];
}

export function splineLength(entity: DxfEntity, samples = 500): number {
  const { degree, knots, controlPoints } = entity;
  if (!degree || !knots || !controlPoints) return 0;
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];
  let len = 0;
  let prev = deBoor(degree, knots, controlPoints, tMin);
  for (let i = 1; i <= samples; i++) {
    const t = tMin + (tMax - tMin) * (i / samples);
    const curr = deBoor(degree, knots, controlPoints, t);
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    len += Math.sqrt(dx * dx + dy * dy);
    prev = curr;
  }
  return len;
}
