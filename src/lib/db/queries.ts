import type { DbClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface DbMaterial {
  id: number;
  name: string;
  thickness_mm: number;
  base_cost_mvr: number;
  active: number;
}

export interface DbColorRate {
  id: number;
  material_id: number;
  color_key: string;
  operation: 'cut' | 'engrave' | 'score';
  rate_mvr_mm: number;
}

export interface DbAddon {
  id: number;
  service: string;
  label: string;
  price_mvr: number;
  price_type: 'fixed' | 'per_sqft';
  active: number;
  group_key: string | null;
}

export type PricingConfigRow = { key: string; value: string };
export type PricingConfigMap = Record<string, number>;

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByUsername(db: DbClient, username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first<DbUser>();
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function getMaterials(db: DbClient): Promise<DbMaterial[]> {
  const { results } = await db.prepare('SELECT * FROM materials WHERE active = 1 ORDER BY name, thickness_mm').bind().all<DbMaterial>();
  return results;
}

export async function getAllMaterials(db: DbClient): Promise<DbMaterial[]> {
  const { results } = await db.prepare('SELECT * FROM materials ORDER BY name, thickness_mm').bind().all<DbMaterial>();
  return results;
}

export async function getMaterialById(db: DbClient, id: number): Promise<DbMaterial | null> {
  return db.prepare('SELECT * FROM materials WHERE id = ?').bind(id).first<DbMaterial>();
}

export async function createMaterial(db: DbClient, m: Omit<DbMaterial, 'id' | 'active'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO materials (name, thickness_mm, base_cost_mvr) VALUES (?, ?, ?)'
  ).bind(m.name, m.thickness_mm, m.base_cost_mvr).run();
  return result.meta?.last_row_id ?? 0;
}

export async function updateMaterial(db: DbClient, id: number, m: Partial<Omit<DbMaterial, 'id'>>): Promise<void> {
  const fields: string[] = [];
  const vals: unknown[] = [];
  if (m.name !== undefined)          { fields.push('name = ?');          vals.push(m.name); }
  if (m.thickness_mm !== undefined)  { fields.push('thickness_mm = ?');  vals.push(m.thickness_mm); }
  if (m.base_cost_mvr !== undefined) { fields.push('base_cost_mvr = ?'); vals.push(m.base_cost_mvr); }
  if (m.active !== undefined)        { fields.push('active = ?');        vals.push(m.active); }
  if (fields.length === 0) return;
  vals.push(id);
  await db.prepare(`UPDATE materials SET ${fields.join(', ')} WHERE id = ?`).bind(...vals).run();
}

export async function deleteMaterial(db: DbClient, id: number): Promise<void> {
  await db.prepare('DELETE FROM materials WHERE id = ?').bind(id).run();
}

// ─── Color rates ──────────────────────────────────────────────────────────────

export async function getColorRatesByMaterial(db: DbClient, materialId: number): Promise<DbColorRate[]> {
  const { results } = await db.prepare('SELECT * FROM color_rates WHERE material_id = ?').bind(materialId).all<DbColorRate>();
  return results;
}

export async function upsertColorRate(db: DbClient, rate: Omit<DbColorRate, 'id'>): Promise<void> {
  await db.prepare(
    `INSERT INTO color_rates (material_id, color_key, operation, rate_mvr_mm)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(material_id, color_key) DO UPDATE SET operation = excluded.operation, rate_mvr_mm = excluded.rate_mvr_mm`
  ).bind(rate.material_id, rate.color_key, rate.operation, rate.rate_mvr_mm).run();
}

export async function deleteColorRate(db: DbClient, id: number): Promise<void> {
  await db.prepare('DELETE FROM color_rates WHERE id = ?').bind(id).run();
}

// ─── Add-ons ──────────────────────────────────────────────────────────────────

export async function getAddons(db: DbClient, service?: string): Promise<DbAddon[]> {
  if (service) {
    const { results } = await db.prepare(
      "SELECT * FROM addons WHERE active = 1 AND (service = ? OR service = 'all') ORDER BY label"
    ).bind(service).all<DbAddon>();
    return results;
  }
  const { results } = await db.prepare('SELECT * FROM addons ORDER BY service, label').bind().all<DbAddon>();
  return results;
}

export async function createAddon(db: DbClient, a: Omit<DbAddon, 'id' | 'active'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO addons (service, label, price_mvr, price_type, group_key) VALUES (?, ?, ?, ?, ?)'
  ).bind(a.service, a.label, a.price_mvr, a.price_type, a.group_key ?? null).run();
  return result.meta?.last_row_id ?? 0;
}

export async function updateAddon(db: DbClient, id: number, a: Partial<Omit<DbAddon, 'id'>>): Promise<void> {
  const fields: string[] = [];
  const vals: unknown[] = [];
  if (a.service !== undefined)    { fields.push('service = ?');    vals.push(a.service); }
  if (a.label !== undefined)      { fields.push('label = ?');      vals.push(a.label); }
  if (a.price_mvr !== undefined)  { fields.push('price_mvr = ?');  vals.push(a.price_mvr); }
  if (a.price_type !== undefined) { fields.push('price_type = ?'); vals.push(a.price_type); }
  if (a.active !== undefined)     { fields.push('active = ?');     vals.push(a.active); }
  if (a.group_key !== undefined)  { fields.push('group_key = ?');  vals.push(a.group_key); }
  if (fields.length === 0) return;
  vals.push(id);
  await db.prepare(`UPDATE addons SET ${fields.join(', ')} WHERE id = ?`).bind(...vals).run();
}

export async function deleteAddon(db: DbClient, id: number): Promise<void> {
  await db.prepare('DELETE FROM addons WHERE id = ?').bind(id).run();
}

// ─── Pricing config ───────────────────────────────────────────────────────────

export async function getPricingConfig(db: DbClient): Promise<PricingConfigMap> {
  const { results } = await db.prepare('SELECT key, value FROM pricing_config').bind().all<PricingConfigRow>();
  const map: PricingConfigMap = {};
  for (const row of results) map[row.key] = parseFloat(row.value);
  return map;
}

export async function upsertPricingConfig(db: DbClient, key: string, value: number): Promise<void> {
  await db.prepare(
    `INSERT INTO pricing_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).bind(key, String(value)).run();
}
