export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { getStandardColors, upsertStandardColor, deleteStandardColor } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getStandardColors(getDb()));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { color_key, operation, label, hex } = body;
  if (!color_key || !operation || !label || !hex) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const db = getDb();
  await upsertStandardColor(db, { color_key, operation, label, hex });
  return NextResponse.json(await getStandardColors(db));
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const db = getDb();
  await deleteStandardColor(db, id);
  return NextResponse.json(await getStandardColors(db));
}
