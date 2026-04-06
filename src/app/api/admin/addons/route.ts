import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { getAddons, createAddon } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  return NextResponse.json(await getAddons(db));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = getDb();
  const id = await createAddon(db, { service: body.service, label: body.label, price_mvr: body.price_mvr, price_type: body.price_type ?? 'fixed', group_key: body.group_key ?? null });
  return NextResponse.json({ id, ...body }, { status: 201 });
}
