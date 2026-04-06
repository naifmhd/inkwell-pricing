import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { getAllMaterials, createMaterial, getColorRatesByMaterial } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const materials = await getAllMaterials(db);
  const withRates = await Promise.all(
    materials.map(async m => ({ ...m, colorRates: await getColorRatesByMaterial(db, m.id) }))
  );
  return NextResponse.json(withRates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = getDb();
  const id = await createMaterial(db, { name: body.name, thickness_mm: body.thickness_mm, base_cost_mvr: body.base_cost_mvr });
  return NextResponse.json({ id, ...body }, { status: 201 });
}
