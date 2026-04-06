import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getMaterials } from '@/lib/db/queries';

export async function GET() {
  const db = getDb();
  return NextResponse.json(await getMaterials(db));
}
