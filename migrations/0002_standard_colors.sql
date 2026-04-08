-- ─── Standard color scheme ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS standard_colors (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  color_key TEXT    NOT NULL UNIQUE,
  operation TEXT    NOT NULL CHECK(operation IN ('cut','engrave','score')),
  label     TEXT    NOT NULL,
  hex       TEXT    NOT NULL DEFAULT '#888888'
);

INSERT OR IGNORE INTO standard_colors (color_key, operation, label, hex) VALUES
  ('1', 'cut',     'Red',   '#FF0000'),
  ('5', 'engrave', 'Blue',  '#0000FF'),
  ('3', 'score',   'Green', '#00AA00');
