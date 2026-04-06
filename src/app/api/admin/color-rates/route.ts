import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { upsertColorRate, deleteColorRate } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = getDb();
  await upsertColorRate(db, { material_id: body.material_id, color_key: body.color_key, operation: body.operation, rate_mvr_mm: body.rate_mvr_mm });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const db = getDb();
  await deleteColorRate(db, id);
  return NextResponse.json({ ok: true });
}
