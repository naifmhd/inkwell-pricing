export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { analyseBuffer } from '@/lib/dxf/analyse';

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

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('DXF analyse error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to parse DXF' },
      { status: 500 },
    );
  }
}
