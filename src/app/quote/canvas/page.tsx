'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/components/quote/QuoteContext';
import { DimensionInput } from '@/components/quote/DimensionInput';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';

export default function CanvasPage() {
  const { widthMm, heightMm, set } = useQuote();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function getQuote() {
    if (!widthMm || !heightMm) return;
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'canvas', widthMm, heightMm, addonIds: [] }),
    });
    set({ result: await res.json() });
    router.push('/quote/result');
    setLoading(false);
  }
  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Canvas Printing' }]} />
      <div><h2 className="text-2xl font-bold text-zinc-900 mb-1">Canvas Printing</h2><p className="text-zinc-500">18 MVR per square foot.</p></div>
      <section className="bg-white rounded-xl border p-5"><DimensionInput /></section>
      <button onClick={getQuote} disabled={!widthMm || !heightMm || loading}
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-white font-semibold disabled:opacity-40 hover:bg-zinc-700">
        {loading ? 'Calculating…' : 'Get Quote →'}
      </button>
    </div>
  );
}
