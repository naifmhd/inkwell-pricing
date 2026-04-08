import type { DxfAnalysis } from '@/lib/dxf/types';
import type { DbAddon, DbColorRate, DbMaterial } from '@/lib/db/queries';
import type { ColorBreakdownLine, ExtraMaterialResult, LaserQuoteResult, Operation } from './types';
import { round2 } from '@/lib/units';

// Default color → operation fallback (when no explicit rate row exists)
const DEFAULT_COLOR_OPS: Record<string, Operation> = {
  '1': 'cut', '2': 'score', '3': 'engrave', '4': 'cut',
  '5': 'cut', '6': 'score', '7': 'cut',
  '250': 'engrave', '251': 'engrave', '252': 'score',
  'ByLayer': 'cut',
};

function resolveOperation(colorKey: string): Operation {
  return DEFAULT_COLOR_OPS[colorKey] ?? 'cut';
}

export function calcLaserQuote(
  dxfAnalysis: DxfAnalysis,
  material: DbMaterial,
  colorRates: DbColorRate[],
  addons: DbAddon[],
  setupFeeMvr: number,
  sprayAddon?: DbAddon | null,
  extraMaterialsIn?: { material: DbMaterial; widthMm: number; heightMm: number }[],
  colorOverrides?: Record<string, Operation | 'ignore'>,
): LaserQuoteResult {
  const rateMap = new Map(colorRates.map(r => [r.color_key, r]));

  const colorBreakdown: ColorBreakdownLine[] = dxfAnalysis.colors
    .filter(cg => colorOverrides?.[cg.colorKey] !== 'ignore')
    .map(cg => {
      const override = colorOverrides?.[cg.colorKey];
      const rateRow = rateMap.get(cg.colorKey);
      const operation: Operation = (override as Operation | undefined) ?? rateRow?.operation ?? resolveOperation(cg.colorKey);
      const rateMvrMm = rateRow?.rate_mvr_mm ?? 0;
      return {
        colorKey: cg.colorKey,
        label: cg.label,
        operation,
        lengthMm: cg.total,
        rateMvrMm,
        subtotalMvr: round2(cg.total * rateMvrMm),
      };
    });

  const pathCostMvr = round2(colorBreakdown.reduce((s, l) => s + l.subtotalMvr, 0));
  const addonsMvr = round2(addons.reduce((s, a) => s + a.price_mvr, 0));
  const sprayMvr = sprayAddon ? round2(sprayAddon.price_mvr) : 0;

  const extraMaterials: ExtraMaterialResult[] = (extraMaterialsIn ?? []).map(em => ({
    name: em.material.name,
    thickness_mm: em.material.thickness_mm,
    widthMm: em.widthMm,
    heightMm: em.heightMm,
    costMvr: em.material.base_cost_mvr,
  }));
  const extraMaterialsMvr = round2(extraMaterials.reduce((s, em) => s + em.costMvr, 0));

  const totalMvr = round2(pathCostMvr + material.base_cost_mvr + addonsMvr + sprayMvr + extraMaterialsMvr + setupFeeMvr);

  return {
    service: 'laser',
    material: { name: material.name, thickness_mm: material.thickness_mm },
    colorBreakdown,
    pathCostMvr,
    baseCostMvr: material.base_cost_mvr,
    sprayAddon: sprayAddon ? { label: sprayAddon.label, price_mvr: sprayAddon.price_mvr } : null,
    sprayMvr,
    extraMaterials,
    extraMaterialsMvr,
    addonsMvr,
    setupFeeMvr,
    addons: addons.map(a => ({ label: a.label, price_mvr: a.price_mvr })),
    totalMvr,
    widthMm: dxfAnalysis.bb.width,
    heightMm: dxfAnalysis.bb.height,
    totalLengthMm: dxfAnalysis.totalLength,
  };
}
