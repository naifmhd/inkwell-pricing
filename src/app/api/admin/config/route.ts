import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { getPricingConfig, upsertPricingConfig } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await getPricingConfig(getDb()));
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, number>;
  const db = getDb();
  await Promise.all(Object.entries(body).map(([k, v]) => upsertPricingConfig(db, k, v)));
  return NextResponse.json(await getPricingConfig(db));
}
