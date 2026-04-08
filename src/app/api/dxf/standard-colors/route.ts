export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getStandardColors } from '@/lib/db/queries';

export async function GET() {
  const colors = await getStandardColors(getDb());
  return NextResponse.json(colors);
}
