export interface DxfPoint {
  x: number;
  y: number;
  z?: number;
}

export interface DxfEntity {
  type: string;
  colorNumber?: number;
  layer?: string;
  closed?: boolean;
  vertices?: DxfPoint[];
  controlPoints?: DxfPoint[];
  knots?: number[];
  degree?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ColorGroup {
  colorKey: string;
  label: string;
  count: number;
  closed: number;
  total: number;   // total path length in mm
  min: number;
  max: number;
}

export interface DxfAnalysis {
  bb: BoundingBox;
  colors: ColorGroup[];
  totalLength: number;
  typeCounts: Record<string, number>;
  unitShort: string;
  entityCount: number;
  svg: string;
  nonStandardColors?: string[];
  colorValidation?: 'ok' | 'warn';
}
