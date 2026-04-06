import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getAddons } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get('service') ?? undefined;
  const db = getDb();
  return NextResponse.json(await getAddons(db, service));
}
