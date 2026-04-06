'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/components/quote/QuoteContext';
import { DimensionInput } from '@/components/quote/DimensionInput';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';

interface Addon { id: number; label: string; price_mvr: number; price_type: string; }

export default function StickerPrintPage() {
  const { widthMm, heightMm, addonIds, set } = useQuote();
  const router = useRouter();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/addons?service=sticker_print').then(r => r.json()).then(setAddons);
  }, []);

  function toggleAddon(id: number) {
    set({ addonIds: addonIds.includes(id) ? addonIds.filter(x => x !== id) : [...addonIds, id] });
  }

  async function getQuote() {
    if (!widthMm || !heightMm) return;
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'sticker_print', widthMm, heightMm, addonIds }),
    });
    set({ result: await res.json() });
    router.push('/quote/result');
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Sticker Printing' }]} />
      <div><h2 className="text-2xl font-bold text-zinc-900 mb-1">Sticker Printing</h2><p className="text-zinc-500">25 MVR per square foot.</p></div>
      <section className="bg-white rounded-xl border p-5"><DimensionInput /></section>
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
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-white font-semibold disabled:opacity-40 hover:bg-zinc-700">
        {loading ? 'Calculating…' : 'Get Quote →'}
      </button>
    </div>
  );
}
