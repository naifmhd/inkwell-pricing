import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getMaterialById, getColorRatesByMaterial, getAddons, getPricingConfig } from '@/lib/db/queries';
import { calcLaserQuote } from '@/lib/pricing/laser';
import { calcStickerQuote } from '@/lib/pricing/sticker';
import { calcCanvasQuote, calcStickerPrintQuote } from '@/lib/pricing/canvas';
import { calcSunboardQuote } from '@/lib/pricing/sunboard';
import type { QuoteRequest, LaserQuoteRequest, DimensionQuoteRequest } from '@/lib/pricing/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest;
    const db = getDb();
    const config = await getPricingConfig(db);

    if (body.service === 'laser') {
      const laserReq = body as LaserQuoteRequest;
      const material = await getMaterialById(db, laserReq.materialId);
      if (!material) return NextResponse.json({ error: 'Material not found' }, { status: 404 });
      const colorRates = await getColorRatesByMaterial(db, laserReq.materialId);
      const allAddons = await getAddons(db, 'laser');
      const selectedAddons = allAddons.filter(a => laserReq.addonIds.includes(a.id));
      const sprayAddon = laserReq.sprayAddonId
        ? (allAddons.find(a => a.id === laserReq.sprayAddonId) ?? null)
        : null;
      const extraMaterialsIn = await Promise.all(
        (laserReq.extraMaterials ?? []).map(async em => ({
          material: (await getMaterialById(db, em.materialId))!,
          widthMm: em.widthMm,
          heightMm: em.heightMm,
        }))
      );
      const result = calcLaserQuote(laserReq.dxfAnalysis, material, colorRates, selectedAddons, config['setup_fee_mvr'] ?? 50, sprayAddon, extraMaterialsIn.filter(em => em.material), laserReq.colorOverrides);
      return NextResponse.json(result);
    }

    const dimReq = body as DimensionQuoteRequest;
    const { widthMm, heightMm, addonIds } = dimReq;
    const allAddons = await getAddons(db, dimReq.service);
    const selectedAddons = allAddons.filter(a => addonIds.includes(a.id));

    if (dimReq.service === 'sticker') {
      return NextResponse.json(calcStickerQuote(widthMm, heightMm, selectedAddons, {
        threshold_sqft: config['sticker_threshold_sqft'] ?? 4,
        small_rate_mvr_sqin: config['sticker_small_rate_mvr_sqin'] ?? 0.5,
        large_print_mvr_sqft: config['sticker_print_rate_mvr_sqft'] ?? 25,
        large_rate_mvr_sqin: config['sticker_large_rate_mvr_sqin'] ?? 0.2,
      }));
    }
    if (dimReq.service === 'canvas') {
      return NextResponse.json(calcCanvasQuote(widthMm, heightMm, selectedAddons, config['canvas_rate_mvr_sqft'] ?? 18));
    }
    if (dimReq.service === 'sticker_print') {
      return NextResponse.json(calcStickerPrintQuote(widthMm, heightMm, selectedAddons, config['sticker_print_rate_mvr_sqft'] ?? 25));
    }
    if (dimReq.service === 'sunboard') {
      return NextResponse.json(calcSunboardQuote(widthMm, heightMm, dimReq.sunboardThicknessMm ?? 3, selectedAddons,
        config['sunboard_3mm_rate_mvr_sqft'] ?? 70, config['sunboard_6mm_rate_mvr_sqft'] ?? 80));
    }

    return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
  } catch (err) {
    console.error('Quote error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
