import type { DbAddon } from '@/lib/db/queries';
import type { DimensionQuoteResult } from './types';
import { sqMmToSqIn, sqMmToSqFt, round2 } from '@/lib/units';

interface StickerConfig {
  threshold_sqft: number;
  small_rate_mvr_sqin: number;
  large_print_mvr_sqft: number;
  large_rate_mvr_sqin: number;
}

export function calcStickerQuote(
  widthMm: number,
  heightMm: number,
  addons: DbAddon[],
  config: StickerConfig,
): DimensionQuoteResult {
  const areaSqIn = sqMmToSqIn(widthMm * heightMm);
  const areaSqFt = sqMmToSqFt(widthMm * heightMm);

  const breakdown: Record<string, number> = {};

  let baseMvr: number;
  if (areaSqFt <= config.threshold_sqft) {
    baseMvr = round2(areaSqIn * config.small_rate_mvr_sqin);
    breakdown['Base (≤4ft×1ft)'] = baseMvr;
  } else {
    const printCost = round2(areaSqFt * config.large_print_mvr_sqft);
    const cutCost = round2(areaSqIn * config.large_rate_mvr_sqin);
    baseMvr = round2(printCost + cutCost);
    breakdown['Print cost'] = printCost;
    breakdown['Cut cost'] = cutCost;
  }

  let addonsMvr = 0;
  for (const a of addons) {
    const cost = round2(a.price_type === 'per_sqft' ? a.price_mvr * areaSqFt : a.price_mvr);
    breakdown[a.label] = cost;
    addonsMvr = round2(addonsMvr + cost);
  }

  return {
    service: 'sticker',
    widthMm, heightMm, areaSqIn, areaSqFt,
    breakdown,
    addonsMvr,
    addons: addons.map(a => ({ label: a.label, price_mvr: a.price_mvr })),
    totalMvr: round2(baseMvr + addonsMvr),
  };
}
