'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/components/quote/QuoteContext';
import { DimensionInput } from '@/components/quote/DimensionInput';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';

export default function SunboardPage() {
  const { widthMm, heightMm, sunboardThickness, set } = useQuote();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function getQuote() {
    if (!widthMm || !heightMm) return;
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'sunboard', widthMm, heightMm, sunboardThicknessMm: sunboardThickness, addonIds: [] }),
    });
    set({ result: await res.json() });
    router.push('/quote/result');
    setLoading(false);
  }
  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Sunboard' }]} />
      <div><h2 className="text-2xl font-bold text-zinc-900 mb-1">Sunboard</h2><p className="text-zinc-500">Rigid panels — 3mm (70 MVR/sqft) or 6mm (80 MVR/sqft).</p></div>
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-zinc-700 mb-2">Thickness</p>
          <div className="flex gap-3">
            {([3, 6] as const).map(t => (
              <button key={t} onClick={() => set({ sunboardThickness: t })}
                className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${sunboardThickness === t ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'}`}>
                {t}mm
              </button>
            ))}
          </div>
        </div>
        <DimensionInput />
      </section>
      <button onClick={getQuote} disabled={!widthMm || !heightMm || loading}
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-white font-semibold disabled:opacity-40 hover:bg-zinc-700">
        {loading ? 'Calculating…' : 'Get Quote →'}
      </button>
    </div>
  );
}
