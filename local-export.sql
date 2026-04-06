PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO users VALUES(1,'admin','$2b$12$9WkAzf5ry1cSpQOw/EtKZu8UtGbq6C8uujuhE6ZCmCDtfjFZxubrK','2026-04-05 17:21:38');
CREATE TABLE materials (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  thickness_mm   REAL    NOT NULL,
  base_cost_mvr  REAL    NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1,
  UNIQUE(name, thickness_mm)
);
INSERT INTO materials VALUES(11,'Black Acrylic',6.0,95.0,1);
INSERT INTO materials VALUES(12,'Mirror Acrylic',5.0,115.0,1);
INSERT INTO materials VALUES(13,'Color Acrylic',3.0,65.0,1);
INSERT INTO materials VALUES(14,'White Acrylic',6.0,95.0,1);
INSERT INTO materials VALUES(15,'Luminous White Acrylic',3.0,80.0,1);
INSERT INTO materials VALUES(16,'Clear Acrylic',3.0,65.0,1);
INSERT INTO materials VALUES(17,'Clear Acrylic',6.0,95.0,1);
INSERT INTO materials VALUES(18,'Pine Wood',6.0,50.0,1);
INSERT INTO materials VALUES(19,'Mirror Acrylic',3.0,100.0,1);
CREATE TABLE color_rates (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id  INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  color_key    TEXT    NOT NULL,
  operation    TEXT    NOT NULL CHECK(operation IN ('cut','engrave','score')),
  rate_mvr_mm  REAL    NOT NULL,
  UNIQUE(material_id, color_key)
);
INSERT INTO color_rates VALUES(51,16,'7','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(52,13,'7','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(53,15,'7','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(54,19,'7','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(55,16,'ByLayer','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(56,13,'ByLayer','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(57,15,'ByLayer','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(58,19,'ByLayer','cut',0.05000000000000000277);
INSERT INTO color_rates VALUES(59,16,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(60,13,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(61,15,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(62,19,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(63,16,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(64,13,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(65,15,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(66,19,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(67,16,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(68,13,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(69,15,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(70,19,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(71,11,'7','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(72,17,'7','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(73,12,'7','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(74,14,'7','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(75,11,'ByLayer','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(76,17,'ByLayer','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(77,12,'ByLayer','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(78,14,'ByLayer','cut',0.05999999999999999778);
INSERT INTO color_rates VALUES(79,11,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(80,17,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(81,12,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(82,14,'250','engrave',0.0269999999999999997);
INSERT INTO color_rates VALUES(83,11,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(84,17,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(85,12,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(86,14,'2','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(87,11,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(88,17,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(89,12,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(90,14,'6','score',0.02500000000000000138);
INSERT INTO color_rates VALUES(91,18,'7','cut',0.06500000000000000222);
INSERT INTO color_rates VALUES(92,18,'ByLayer','cut',0.06500000000000000222);
INSERT INTO color_rates VALUES(93,18,'250','engrave',0.02500000000000000138);
INSERT INTO color_rates VALUES(94,18,'2','score',0.02999999999999999889);
INSERT INTO color_rates VALUES(95,18,'6','score',0.02999999999999999889);
CREATE TABLE addons (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service     TEXT    NOT NULL,
  label       TEXT    NOT NULL,
  price_mvr   REAL    NOT NULL,
  price_type  TEXT    NOT NULL DEFAULT 'fixed' CHECK(price_type IN ('fixed','per_sqft')),
  active      INTEGER NOT NULL DEFAULT 1
, group_key TEXT);
INSERT INTO addons VALUES(1,'sticker_print','Cleaning',5.0,'per_sqft',1,NULL);
INSERT INTO addons VALUES(2,'sticker_print','Installation',10.0,'per_sqft',1,NULL);
INSERT INTO addons VALUES(3,'laser','White',15.0,'fixed',1,'spray');
INSERT INTO addons VALUES(4,'laser','Black',15.0,'fixed',1,'spray');
INSERT INTO addons VALUES(5,'laser','Red',20.0,'fixed',1,'spray');
INSERT INTO addons VALUES(6,'laser','Gold',25.0,'fixed',1,'spray');
INSERT INTO addons VALUES(7,'laser','Silver',25.0,'fixed',1,'spray');
INSERT INTO addons VALUES(8,'sticker_print','Cleaning',5.0,'per_sqft',1,NULL);
INSERT INTO addons VALUES(9,'sticker_print','Installation',10.0,'per_sqft',1,NULL);
INSERT INTO addons VALUES(10,'laser','White',15.0,'fixed',1,'spray');
INSERT INTO addons VALUES(11,'laser','Black',15.0,'fixed',1,'spray');
INSERT INTO addons VALUES(12,'laser','Red',20.0,'fixed',1,'spray');
INSERT INTO addons VALUES(13,'laser','Gold',25.0,'fixed',1,'spray');
INSERT INTO addons VALUES(14,'laser','Silver',25.0,'fixed',1,'spray');
CREATE TABLE pricing_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO pricing_config VALUES('setup_fee_mvr','50');
INSERT INTO pricing_config VALUES('sticker_threshold_sqft','4');
INSERT INTO pricing_config VALUES('sticker_small_rate_mvr_sqin','0.5');
INSERT INTO pricing_config VALUES('sticker_large_rate_mvr_sqin','0.2');
INSERT INTO pricing_config VALUES('canvas_rate_mvr_sqft','18');
INSERT INTO pricing_config VALUES('sunboard_3mm_rate_mvr_sqft','70');
INSERT INTO pricing_config VALUES('sunboard_6mm_rate_mvr_sqft','80');
INSERT INTO pricing_config VALUES('sticker_print_rate_mvr_sqft','25');
CREATE TABLE _cf_METADATA (
        key INTEGER PRIMARY KEY,
        value BLOB
      );
INSERT INTO _cf_METADATA VALUES(2,4);
INSERT INTO sqlite_sequence VALUES('addons',14);
INSERT INTO sqlite_sequence VALUES('materials',29);
INSERT INTO sqlite_sequence VALUES('color_rates',95);
INSERT INTO sqlite_sequence VALUES('users',2);
COMMIT;
