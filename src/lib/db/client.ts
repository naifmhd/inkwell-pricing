import path from 'path';
import fs from 'fs';

export interface DbStatement {
  bind(...args: unknown[]): {
    first<T = unknown>(): Promise<T | null>;
    all<T = unknown>(): Promise<{ results: T[] }>;
    run(): Promise<{ meta?: { last_row_id?: number } }>;
  };
}

export interface DbClient {
  prepare(sql: string): DbStatement;
}

// Wraps better-sqlite3 (sync) behind the async D1 interface
function wrapSqlite(db: import('better-sqlite3').Database): DbClient {
  return {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first<T>() {
              return (db.prepare(sql).get(...(args as never[])) as T) ?? null;
            },
            async all<T>() {
              return { results: db.prepare(sql).all(...(args as never[])) as T[] };
            },
            async run() {
              const info = db.prepare(sql).run(...(args as never[]));
              return { meta: { last_row_id: Number(info.lastInsertRowid) } };
            },
          };
        },
      };
    },
  };
}

function findLocalSqlite(): string {
  const base = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1');
  if (!fs.existsSync(base)) {
    throw new Error('Local D1 database not found. Run: npx wrangler d1 execute inkwell-db --local --file=migrations/0001_init.sql');
  }
  let best = { file: '', size: -1 };
  for (const sub of fs.readdirSync(base)) {
    const subPath = path.join(base, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;
    for (const file of fs.readdirSync(subPath)) {
      if (!file.endsWith('.sqlite') || file === 'metadata.sqlite') continue;
      const fullPath = path.join(subPath, file);
      const size = fs.statSync(fullPath).size;
      if (size > best.size) best = { file: fullPath, size };
    }
  }
  if (!best.file) throw new Error('No .sqlite file found under .wrangler/state/v3/d1');
  return best.file;
}

let _devDb: DbClient | null = null;

export function getDb(): DbClient {
  if (process.env.NODE_ENV !== 'production') {
    if (!_devDb) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const dbPath = findLocalSqlite();
      _devDb = wrapSqlite(new Database(dbPath));
    }
    return _devDb;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getCloudflareContext } = require('@opennextjs/cloudflare');
  const env = getCloudflareContext().env as { DB: DbClient };
  if (!env?.DB) {
    throw new Error('Cloudflare D1 binding (DB) not available');
  }
  return env.DB;
}
