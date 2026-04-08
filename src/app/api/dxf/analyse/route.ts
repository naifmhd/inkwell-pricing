export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { analyseBuffer } from '@/lib/dxf/analyse';
import { getDb } from '@/lib/db/client';
import { getStandardColorMap } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const content = new TextDecoder('utf-8').decode(bytes);
    const analysis = analyseBuffer(content);

    const standardMap = await getStandardColorMap(getDb());
    const nonStandardColors = analysis.colors
      .map(c => c.colorKey)
      .filter(k => !standardMap.has(k));

    return NextResponse.json({
      ...analysis,
      nonStandardColors,
      colorValidation: nonStandardColors.length > 0 ? 'warn' : 'ok',
    });
  } catch (err) {
    console.error('DXF analyse error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to parse DXF' },
      { status: 500 },
    );
  }
}
