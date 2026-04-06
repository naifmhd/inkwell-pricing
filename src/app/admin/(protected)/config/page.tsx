'use client';
import { useEffect, useState } from 'react';

type Config = Record<string, number>;
const LABELS: Record<string, string> = {
  setup_fee_mvr:               'Setup fee (MVR)',
  sticker_threshold_sqft:      'Sticker small threshold (sqft)',
  sticker_small_rate_mvr_sqin: 'Sticker small rate (MVR/sqin)',
  sticker_large_rate_mvr_sqin: 'Sticker large cut rate (MVR/sqin)',
  canvas_rate_mvr_sqft:        'Canvas rate (MVR/sqft)',
  sticker_print_rate_mvr_sqft: 'Sticker print rate (MVR/sqft)',
  sunboard_3mm_rate_mvr_sqft:  'Sunboard 3mm (MVR/sqft)',
  sunboard_6mm_rate_mvr_sqft:  'Sunboard 6mm (MVR/sqft)',
};

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetch('/api/admin/config').then(r => r.json()).then(setConfig); }, []);

  async function save() {
    await fetch('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Pricing Configuration</h2>
      <div className="bg-white rounded-xl border p-5 space-y-4">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="flex-1 text-sm text-zinc-700">{label}</label>
            <input
              type="number" step="0.001" value={config[key] ?? ''}
              onChange={e => setConfig(c => ({ ...c, [key]: Number(e.target.value) }))}
              className="w-36 rounded-lg border px-3 py-1.5 text-sm text-right"
            />
          </div>
        ))}
        <button onClick={save} className="mt-2 rounded-lg bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-700 transition-colors">
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
