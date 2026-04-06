import type { DxfAnalysis } from '@/lib/dxf/types';
import type { DbAddon, DbColorRate, DbMaterial } from '@/lib/db/queries';

export type Operation = 'cut' | 'engrave' | 'score';
export type ServiceType = 'laser' | 'sticker' | 'canvas' | 'sunboard' | 'sticker_print';

export interface MaterialWithRates extends DbMaterial {
  colorRates: DbColorRate[];
}

// ─── Laser ────────────────────────────────────────────────────────────────────

export interface ExtraMaterialRequest {
  materialId: number;
  widthMm: number;
  heightMm: number;
}

export interface LaserQuoteRequest {
  service: 'laser';
  dxfAnalysis: DxfAnalysis;
  materialId: number;
  addonIds: number[];
  sprayAddonId?: number | null;
  extraMaterials?: ExtraMaterialRequest[];
}

export interface ColorBreakdownLine {
  colorKey: string;
  label: string;
  operation: Operation;
  lengthMm: number;
  rateMvrMm: number;
  subtotalMvr: number;
}

export interface ExtraMaterialResult {
  name: string;
  thickness_mm: number;
  widthMm: number;
  heightMm: number;
  costMvr: number;
}

export interface LaserQuoteResult {
  service: 'laser';
  material: Pick<DbMaterial, 'name' | 'thickness_mm'>;
  colorBreakdown: ColorBreakdownLine[];
  pathCostMvr: number;
  baseCostMvr: number;
  sprayAddon: Pick<DbAddon, 'label' | 'price_mvr'> | null;
  sprayMvr: number;
  extraMaterials: ExtraMaterialResult[];
  extraMaterialsMvr: number;
  addonsMvr: number;
  setupFeeMvr: number;
  addons: Pick<DbAddon, 'label' | 'price_mvr'>[];
  totalMvr: number;
  widthMm: number;
  heightMm: number;
  totalLengthMm: number;
}

// ─── Dimension-based services ─────────────────────────────────────────────────

export interface DimensionQuoteRequest {
  service: 'sticker' | 'canvas' | 'sunboard' | 'sticker_print';
  widthMm: number;
  heightMm: number;
  sunboardThicknessMm?: 3 | 6;
  addonIds: number[];
}

export interface DimensionQuoteResult {
  service: 'sticker' | 'canvas' | 'sunboard' | 'sticker_print';
  widthMm: number;
  heightMm: number;
  areaSqIn: number;
  areaSqFt: number;
  breakdown: Record<string, number>;
  addonsMvr: number;
  addons: Pick<DbAddon, 'label' | 'price_mvr'>[];
  totalMvr: number;
}

export type QuoteRequest = LaserQuoteRequest | DimensionQuoteRequest;
export type QuoteResult = LaserQuoteResult | DimensionQuoteResult;
