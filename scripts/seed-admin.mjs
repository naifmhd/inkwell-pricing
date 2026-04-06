/**
 * One-time script to seed the admin user.
 * Usage: node scripts/seed-admin.mjs [username] [password]
 * Defaults: admin / changeme
 */
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { readdirSync, existsSync } from 'fs';
import path from 'path';

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'changeme';

// Find the local wrangler D1 sqlite file
function findDbPath() {
  const base = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1');
  if (!existsSync(base)) {
    console.error('Could not find .wrangler/state/v3/d1. Run: npx wrangler d1 execute laser-pricing-db --local --file=migrations/0001_init.sql');
    process.exit(1);
  }
  // Walk one level of subdirectories to find a .sqlite file
  for (const sub of readdirSync(base)) {
    const subPath = path.join(base, sub);
    for (const file of readdirSync(subPath)) {
      if (file.endsWith('.sqlite')) return path.join(subPath, file);
    }
  }
  console.error('No .sqlite file found. Run the migration first.');
  process.exit(1);
}

const dbPath = findDbPath();
console.log('Using DB:', dbPath);

const db = new Database(dbPath);
const hash = await bcrypt.hash(password, 12);

const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
if (existing) {
  db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hash, username);
  console.log(`✓ Updated password for user "${username}"`);
} else {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
  console.log(`✓ Created admin user "${username}" with password "${password}"`);
}
db.close();
