import fs from 'fs';
import path from 'path';

interface R2Client {
  put(key: string, data: ArrayBuffer): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
}

function localR2(): R2Client {
  const dir = path.join(process.cwd(), '.dev-r2');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return {
    async put(key, data) {
      fs.writeFileSync(path.join(dir, key.replace(/\//g, '_')), Buffer.from(data));
    },
    async get(key) {
      const p = path.join(dir, key.replace(/\//g, '_'));
      if (!fs.existsSync(p)) return null;
      return fs.readFileSync(p).buffer as ArrayBuffer;
    },
  };
}

function cloudflareR2(bucket: { put: (k: string, v: ArrayBuffer) => Promise<unknown>; get: (k: string) => Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null> }): R2Client {
  return {
    async put(key, data) { await bucket.put(key, data); },
    async get(key) {
      const obj = await bucket.get(key);
      return obj ? obj.arrayBuffer() : null;
    },
  };
}

export function getR2(cloudflareEnv?: { R2?: unknown }): R2Client {
  if (process.env.NODE_ENV !== 'production') return localR2();
  if (!cloudflareEnv?.R2) return localR2(); // fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cloudflareR2(cloudflareEnv.R2 as any);
}
