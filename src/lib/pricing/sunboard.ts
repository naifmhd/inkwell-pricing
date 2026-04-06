import type { DbAddon } from '@/lib/db/queries';
import type { DimensionQuoteResult } from './types';
import { sqMmToSqIn, sqMmToSqFt, round2 } from '@/lib/units';

export function calcSunboardQuote(
  widthMm: number,
  heightMm: number,
  thicknessMm: 3 | 6,
  addons: DbAddon[],
  rate3mm: number,
  rate6mm: number,
): DimensionQuoteResult {
  const areaSqIn = sqMmToSqIn(widthMm * heightMm);
  const areaSqFt = sqMmToSqFt(widthMm * heightMm);
  const rate = thicknessMm === 3 ? rate3mm : rate6mm;
  const baseMvr = round2(areaSqFt * rate);
  const breakdown: Record<string, number> = { [`Sunboard ${thicknessMm}mm`]: baseMvr };
  let addonsMvr = 0;
  for (const a of addons) {
    const cost = round2(a.price_type === 'per_sqft' ? a.price_mvr * areaSqFt : a.price_mvr);
    breakdown[a.label] = cost;
    addonsMvr = round2(addonsMvr + cost);
  }
  return {
    service: 'sunboard',
    widthMm, heightMm, areaSqIn, areaSqFt,
    breakdown, addonsMvr,
    addons: addons.map(a => ({ label: a.label, price_mvr: a.price_mvr })),
    totalMvr: round2(baseMvr + addonsMvr),
  };
}
