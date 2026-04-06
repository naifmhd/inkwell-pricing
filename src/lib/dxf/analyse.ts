import { parseString, toSVG } from 'dxf';
import type { DxfAnalysis, DxfEntity, ColorGroup } from './types';
import { entityLength, bboxAll } from './measure';

const ACI_NAMES: Record<number, string> = {
  1: 'Red', 2: 'Yellow', 3: 'Green', 4: 'Cyan', 5: 'Blue',
  6: 'Magenta', 7: 'White/Black', 8: 'Dark Gray', 9: 'Gray',
  250: 'Dark Gray', 251: 'Gray', 252: 'Light Gray',
  253: 'Light Gray', 254: 'Light Gray', 255: 'White',
};

function colorName(n: number | undefined): string {
  if (n === undefined || n === null) return 'ByLayer';
  return ACI_NAMES[n] ?? `ACI-${n}`;
}

const INSUNITS: Record<number, string> = {
  0: 'units', 1: 'in', 2: 'ft', 4: 'mm', 5: 'cm', 6: 'm',
};

export function analyseBuffer(content: string): DxfAnalysis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = parseString(content) as any;
  const entities: DxfEntity[] = parsed.entities ?? [];
  const header = parsed.header ?? {};
  const unitShort = INSUNITS[header.insUnits ?? 4] ?? 'mm';

  const bb = bboxAll(entities);

  const colorMap = new Map<string, DxfEntity[]>();
  for (const e of entities) {
    const key = e.colorNumber !== undefined ? String(e.colorNumber) : 'ByLayer';
    if (!colorMap.has(key)) colorMap.set(key, []);
    colorMap.get(key)!.push(e);
  }

  const colors: ColorGroup[] = [];
  let totalLength = 0;

  for (const [colorKey, group] of colorMap.entries()) {
    const lengths = group.map(entityLength);
    const total = lengths.reduce((a, b) => a + b, 0);
    totalLength += total;
    colors.push({
      colorKey,
      label: colorName(colorKey === 'ByLayer' ? undefined : Number(colorKey)),
      count: group.length,
      closed: group.filter(e => e.closed).length,
      total,
      min: Math.min(...lengths),
      max: Math.max(...lengths),
    });
  }

  const typeCounts: Record<string, number> = {};
  for (const e of entities) {
    typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
  }

  const svg = toSVG(parsed);
  return { bb, colors, totalLength, typeCounts, unitShort, entityCount: entities.length, svg };
}
