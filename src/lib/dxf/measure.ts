import type { DxfEntity, BoundingBox } from './types';
import { splineLength } from './bspline';

export function entityLength(entity: DxfEntity): number {
  if (entity.type === 'SPLINE') {
    return splineLength(entity);
  }
  if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
    const verts = entity.vertices ?? [];
    let len = 0;
    for (let i = 1; i < verts.length; i++) {
      const dx = verts[i].x - verts[i - 1].x;
      const dy = verts[i].y - verts[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    if (entity.closed && verts.length > 1) {
      const dx = verts[0].x - verts[verts.length - 1].x;
      const dy = verts[0].y - verts[verts.length - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }
  return 0;
}

export function bboxAll(entities: DxfEntity[]): BoundingBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const e of entities) {
    const pts = e.controlPoints ?? e.vertices ?? [];
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
