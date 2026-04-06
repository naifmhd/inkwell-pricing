'use client';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/components/quote/QuoteContext';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';
import type { LaserQuoteResult, DimensionQuoteResult } from '@/lib/pricing/types';

function fmt(n: number) { return n.toFixed(2); }
const OP_COLOR: Record<string, string> = { cut: 'text-blue-700', engrave: 'text-orange-600', score: 'text-green-700' };

function LaserBreakdown({ result }: { result: LaserQuoteResult }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">{result.material.name} {result.material.thickness_mm}mm — {result.widthMm.toFixed(1)} × {result.heightMm.toFixed(1)} mm — {result.totalLengthMm.toFixed(0)} mm total path</p>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-zinc-500"><th className="pb-2">Color</th><th className="pb-2">Op</th><th className="pb-2 text-right">Length (mm)</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">MVR</th></tr></thead>
        <tbody>
          {result.colorBreakdown.map(l => (
            <tr key={l.colorKey} className="border-b border-zinc-100">
              <td className="py-1.5">{l.colorKey} — {l.label}</td>
              <td className={`py-1.5 font-medium ${OP_COLOR[l.operation] ?? ''}`}>{l.operation}</td>
              <td className="py-1.5 text-right">{l.lengthMm.toFixed(1)}</td>
              <td className="py-1.5 text-right">{l.rateMvrMm.toFixed(4)}</td>
              <td className="py-1.5 text-right font-medium">{fmt(l.subtotalMvr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 text-sm text-zinc-700 pt-1">
        <div className="flex justify-between"><span>Path cost</span><span>{fmt(result.pathCostMvr)} MVR</span></div>
        <div className="flex justify-between"><span>Material base</span><span>{fmt(result.baseCostMvr)} MVR</span></div>
        {result.addons.map(a => <div key={a.label} className="flex justify-between"><span>{a.label}</span><span>{fmt(a.price_mvr)} MVR</span></div>)}
        {result.sprayAddon && <div className="flex justify-between"><span>Spray — {result.sprayAddon.label}</span><span>{fmt(result.sprayAddon.price_mvr)} MVR</span></div>}
        {result.extraMaterials?.map((em, i) => (
          <div key={i} className="flex justify-between">
            <span>Extra: {em.name} {em.thickness_mm}mm ({em.widthMm.toFixed(1)}×{em.heightMm.toFixed(1)} mm)</span>
            <span>{fmt(em.costMvr)} MVR</span>
          </div>
        ))}
        <div className="flex justify-between"><span>Setup fee</span><span>{fmt(result.setupFeeMvr)} MVR</span></div>
      </div>
    </div>
  );
}

function DimBreakdown({ result }: { result: DimensionQuoteResult }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">{+result.widthMm.toFixed(2)} × {+result.heightMm.toFixed(2)} mm — {result.areaSqFt.toFixed(3)} sqft — {result.areaSqIn.toFixed(2)} sqin</p>
      <div className="space-y-1 text-sm text-zinc-700">
        {Object.entries(result.breakdown).map(([k, v]) => (
          <div key={k} className="flex justify-between"><span>{k}</span><span>{fmt(v)} MVR</span></div>
        ))}
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { result, reset } = useQuote();
  const router = useRouter();

  if (!result) {
    router.replace('/quote');
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Result' }]} />
      <div><h2 className="text-2xl font-bold text-zinc-900 mb-1">Your Quote</h2></div>
      <div className="bg-white rounded-xl border p-5 space-y-5">
        {result.service === 'laser'
          ? <LaserBreakdown result={result as LaserQuoteResult} />
          : <DimBreakdown result={result as DimensionQuoteResult} />
        }
        <div className="border-t pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900">Total</span>
          <span className="text-2xl font-bold text-zinc-900">{fmt(result.totalMvr)} MVR</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => { reset(); router.push('/quote'); }}
          className="flex-1 rounded-xl border border-zinc-300 px-6 py-3 font-medium text-zinc-700 hover:bg-zinc-100 transition-colors">
          New Quote
        </button>
      </div>
    </div>
  );
}
