import type { DbAddon } from '@/lib/db/queries';
import type { DimensionQuoteResult } from './types';
import { sqMmToSqIn, sqMmToSqFt, round2 } from '@/lib/units';

export function calcCanvasQuote(
  widthMm: number,
  heightMm: number,
  addons: DbAddon[],
  rateMvrSqft: number,
): DimensionQuoteResult {
  const areaSqIn = sqMmToSqIn(widthMm * heightMm);
  const areaSqFt = sqMmToSqFt(widthMm * heightMm);
  const baseMvr = round2(areaSqFt * rateMvrSqft);
  const breakdown: Record<string, number> = { 'Canvas printing': baseMvr };
  let addonsMvr = 0;
  for (const a of addons) {
    const cost = round2(a.price_type === 'per_sqft' ? a.price_mvr * areaSqFt : a.price_mvr);
    breakdown[a.label] = cost;
    addonsMvr = round2(addonsMvr + cost);
  }
  return {
    service: 'canvas',
    widthMm, heightMm, areaSqIn, areaSqFt,
    breakdown, addonsMvr,
    addons: addons.map(a => ({ label: a.label, price_mvr: a.price_mvr })),
    totalMvr: round2(baseMvr + addonsMvr),
  };
}

export function calcStickerPrintQuote(
  widthMm: number,
  heightMm: number,
  addons: DbAddon[],
  rateMvrSqft: number,
): DimensionQuoteResult {
  const areaSqIn = sqMmToSqIn(widthMm * heightMm);
  const areaSqFt = sqMmToSqFt(widthMm * heightMm);
  const baseMvr = round2(areaSqFt * rateMvrSqft);
  const breakdown: Record<string, number> = { 'Sticker printing': baseMvr };
  let addonsMvr = 0;
  for (const a of addons) {
    const cost = round2(a.price_type === 'per_sqft' ? a.price_mvr * areaSqFt : a.price_mvr);
    breakdown[a.label] = cost;
    addonsMvr = round2(addonsMvr + cost);
  }
  return {
    service: 'sticker_print',
    widthMm, heightMm, areaSqIn, areaSqFt,
    breakdown, addonsMvr,
    addons: addons.map(a => ({ label: a.label, price_mvr: a.price_mvr })),
    totalMvr: round2(baseMvr + addonsMvr),
  };
}
