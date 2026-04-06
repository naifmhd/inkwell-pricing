'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/components/quote/QuoteContext';
import { DxfUploader } from '@/components/quote/DxfUploader';
import { DimensionInput } from '@/components/quote/DimensionInput';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';
import type { DxfAnalysis } from '@/lib/dxf/types';

interface Addon { id: number; label: string; price_mvr: number; price_type: string; service: string; }

export default function StickerPage() {
  const { widthMm, heightMm, addonIds, set } = useQuote();
  const router = useRouter();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [useDxf, setUseDxf] = useState(false);

  useEffect(() => {
    fetch('/api/addons?service=sticker').then(r => r.json()).then(setAddons);
  }, []);

  function toggleAddon(id: number) {
    set({ addonIds: addonIds.includes(id) ? addonIds.filter(x => x !== id) : [...addonIds, id] });
  }

  async function getQuote() {
    if (!widthMm || !heightMm) return;
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'sticker', widthMm, heightMm, addonIds }),
    });
    set({ result: await res.json() });
    router.push('/quote/result');
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Sticker Cutting' }]} />
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Sticker Cutting</h2>
        <p className="text-zinc-500">Enter dimensions or extract them from a DXF file.</p>
      </div>

      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex gap-4">
          <button onClick={() => setUseDxf(false)} className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${!useDxf ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>Enter dimensions</button>
          <button onClick={() => setUseDxf(true)}  className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${useDxf  ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>Upload DXF</button>
        </div>
        {useDxf ? (
          <DxfUploader onAnalysed={(a: DxfAnalysis) => set({ widthMm: Math.round(a.bb.width), heightMm: Math.round(a.bb.height), dxfAnalysis: a })} />
        ) : (
          <DimensionInput />
        )}
      </section>

      {addons.length > 0 && (
        <section className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-zinc-800">Add-ons (optional)</h3>
          {addons.map(a => (
            <label key={a.id} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={addonIds.includes(a.id)} onChange={() => toggleAddon(a.id)} />
              <span className="text-sm text-zinc-700">{a.label} — <b>{a.price_mvr} MVR{a.price_type === 'per_sqft' ? '/sqft' : ''}</b></span>
            </label>
          ))}
        </section>
      )}

      <button onClick={getQuote} disabled={!widthMm || !heightMm || loading}
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-white font-semibold disabled:opacity-40 hover:bg-zinc-700 transition-colors">
        {loading ? 'Calculating…' : 'Get Quote →'}
      </button>
    </div>
  );
}
