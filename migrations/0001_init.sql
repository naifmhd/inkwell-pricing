-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Materials ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  thickness_mm   REAL    NOT NULL,
  base_cost_mvr  REAL    NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1,
  UNIQUE(name, thickness_mm)
);

-- ─── Color → Operation rates (per material) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS color_rates (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id  INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  color_key    TEXT    NOT NULL,
  operation    TEXT    NOT NULL CHECK(operation IN ('cut','engrave','score')),
  rate_mvr_mm  REAL    NOT NULL,
  UNIQUE(material_id, color_key)
);

-- ─── Add-ons ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addons (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service     TEXT    NOT NULL,
  label       TEXT    NOT NULL,
  price_mvr   REAL    NOT NULL,
  price_type  TEXT    NOT NULL DEFAULT 'fixed' CHECK(price_type IN ('fixed','per_sqft')),
  active      INTEGER NOT NULL DEFAULT 1,
  group_key   TEXT
);

-- ─── Global pricing config ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ─── Seed: pricing config defaults ───────────────────────────────────────────
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('setup_fee_mvr',               '50');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sticker_threshold_sqft',      '4');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sticker_small_rate_mvr_sqin', '0.5');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sticker_large_rate_mvr_sqin', '0.2');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('canvas_rate_mvr_sqft',        '18');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sunboard_3mm_rate_mvr_sqft',  '70');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sunboard_6mm_rate_mvr_sqft',  '80');
INSERT OR IGNORE INTO pricing_config (key, value) VALUES ('sticker_print_rate_mvr_sqft', '25');

-- ─── Seed: add-ons ────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type) VALUES ('sticker_print', 'Cleaning',     5,  'per_sqft');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type) VALUES ('sticker_print', 'Installation', 10, 'per_sqft');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type, group_key) VALUES ('laser', 'White',  15, 'fixed', 'spray');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type, group_key) VALUES ('laser', 'Black',  15, 'fixed', 'spray');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type, group_key) VALUES ('laser', 'Red',    20, 'fixed', 'spray');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type, group_key) VALUES ('laser', 'Gold',   25, 'fixed', 'spray');
INSERT OR IGNORE INTO addons (service, label, price_mvr, price_type, group_key) VALUES ('laser', 'Silver', 25, 'fixed', 'spray');

-- ─── Seed: default materials ──────────────────────────────────────────────────
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Black Acrylic',          6,  95);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Mirror Acrylic',         5, 115);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Color Acrylic',          3,  65);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('White Acrylic',          6,  95);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Luminous White Acrylic', 3,  80);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Clear Acrylic',          3,  65);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Clear Acrylic',          6,  95);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Pine Wood',              6,  50);
INSERT OR IGNORE INTO materials (name, thickness_mm, base_cost_mvr) VALUES ('Mirror Acrylic',         3, 100);
