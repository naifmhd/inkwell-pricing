'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote, type ExtraMaterial } from '@/components/quote/QuoteContext';
import { DxfUploader, type ColorOverrides } from '@/components/quote/DxfUploader';
import { ColorGuide } from '@/components/quote/ColorGuide';
import { Breadcrumbs } from '@/components/quote/Breadcrumbs';
import type { DxfAnalysis } from '@/lib/dxf/types';
import type { DbStandardColor } from '@/lib/db/queries';

interface Material { id: number; name: string; thickness_mm: number; base_cost_mvr: number; active: number; }
interface Addon { id: number; label: string; price_mvr: number; price_type: string; group_key: string | null; }

type Panel = 'spray' | 'material' | null;

const TO_MM: Record<string, number> = { mm: 1, in: 25.4, ft: 304.8 };

export default function LaserPage() {
  const { dxfAnalysis, colorOverrides, materialId, addonIds, sprayAddonId, extraMaterials, set } = useQuote();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sprayAddons, setSprayAddons] = useState<Addon[]>([]);
  const [standardColors, setStandardColors] = useState<DbStandardColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  // Extra material add form state
  const [newMatId, setNewMatId] = useState<number | ''>('');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newUnit, setNewUnit] = useState<'mm' | 'in' | 'ft'>('mm');

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
    fetch('/api/addons?service=laser').then(r => r.json()).then((all: Addon[]) =>
      setSprayAddons(all.filter(a => a.group_key === 'spray'))
    );
    fetch('/api/dxf/standard-colors').then(r => r.json()).then(setStandardColors);
  }, []);

  function togglePanel(p: Panel) {
    setOpenPanel(prev => prev === p ? null : p);
  }

  function addExtraMaterial() {
    if (!newMatId || !newWidth || !newHeight) return;
    const uid = crypto.randomUUID();
    const widthMm = parseFloat(newWidth) * TO_MM[newUnit];
    const heightMm = parseFloat(newHeight) * TO_MM[newUnit];
    if (widthMm <= 0 || heightMm <= 0) return;
    set({ extraMaterials: [...extraMaterials, { uid, materialId: Number(newMatId), widthMm, heightMm }] });
    setNewMatId(''); setNewWidth(''); setNewHeight('');
  }

  function removeExtraMaterial(uid: string) {
    set({ extraMaterials: extraMaterials.filter(em => em.uid !== uid) });
  }

  async function getQuote() {
    if (!dxfAnalysis || !materialId) return;
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'laser', dxfAnalysis, materialId, addonIds,
        sprayAddonId: sprayAddonId ?? null,
        extraMaterials: extraMaterials.map(em => ({ materialId: em.materialId, widthMm: em.widthMm, heightMm: em.heightMm })),
        colorOverrides: Object.keys(colorOverrides).length > 0 ? colorOverrides : undefined,
      }),
    });
    set({ result: await res.json() });
    router.push('/quote/result');
    setLoading(false);
  }

  const activeMat = materials.find(m => m.id === newMatId);

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Quote', href: '/quote' }, { label: 'Laser Cutting' }]} />
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Laser Cutting</h2>
        <p className="text-zinc-500">Upload your DXF file, select material and any add-ons.</p>
      </div>

      <section className="bg-white rounded-xl border p-5 space-y-3">
        <h3 className="font-semibold text-zinc-800">1. Upload DXF File</h3>
        <ColorGuide standard={standardColors} />
        <DxfUploader
          standardColors={standardColors}
          onAnalysed={(a: DxfAnalysis, overrides: ColorOverrides) => set({ dxfAnalysis: a, colorOverrides: overrides })}
        />
      </section>

      <section className="bg-white rounded-xl border p-5 space-y-3">
        <h3 className="font-semibold text-zinc-800">2. Select Material</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {materials.filter(m => m.active).map(m => (
            <button key={m.id} onClick={() => set({ materialId: m.id })}
              className={`rounded-lg border p-3 text-sm text-left transition-colors ${materialId === m.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
              <p className="font-medium">{m.name}</p>
              <p className="text-xs opacity-70">{m.thickness_mm}mm</p>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-zinc-800">3. Add-ons (optional)</h3>

        <div className="flex gap-2">
          {/* Spray Paint button */}
          <button onClick={() => togglePanel('spray')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${openPanel === 'spray' ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'}`}>
            <span>Spray Paint</span>
            {sprayAddonId && <span className={`text-xs rounded-full px-1.5 py-0.5 ${openPanel === 'spray' ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}`}>1</span>}
          </button>

          {/* Extra Material button */}
          <button onClick={() => togglePanel('material')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${openPanel === 'material' ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'}`}>
            <span>Extra Material</span>
            {extraMaterials.length > 0 && <span className={`text-xs rounded-full px-1.5 py-0.5 ${openPanel === 'material' ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}`}>{extraMaterials.length}</span>}
          </button>
        </div>

        {/* Spray paint panel */}
        {openPanel === 'spray' && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="spray" checked={!sprayAddonId} onChange={() => set({ sprayAddonId: null })} />
              <span className="text-sm text-zinc-500">No spray</span>
            </label>
            {sprayAddons.map(a => (
              <label key={a.id} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="spray" checked={sprayAddonId === a.id} onChange={() => set({ sprayAddonId: a.id })} />
                <span className="text-sm font-medium text-zinc-800">{a.label}</span>
                <span className="text-sm text-zinc-400 ml-auto">{a.price_mvr} MVR</span>
              </label>
            ))}
          </div>
        )}

        {/* Extra material panel */}
        {openPanel === 'material' && (
          <div className="space-y-3">
            {/* Added materials list */}
            {extraMaterials.map(em => {
              const mat = materials.find(m => m.id === em.materialId);
              return (
                <div key={em.uid} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm">
                  <span className="font-medium text-zinc-800">{mat?.name} {mat?.thickness_mm}mm</span>
                  <span className="text-zinc-400 mx-3">{em.widthMm.toFixed(1)} × {em.heightMm.toFixed(1)} mm</span>
                  <span className="text-zinc-600 mr-3">{mat?.base_cost_mvr} MVR</span>
                  <button onClick={() => removeExtraMaterial(em.uid)} className="text-red-400 hover:text-red-600 font-medium">✕</button>
                </div>
              );
            })}

            {/* Add form */}
            <div className="rounded-lg border border-dashed border-zinc-200 p-4 space-y-3">
              <select value={newMatId} onChange={e => setNewMatId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400">
                <option value="">Select material…</option>
                {materials.filter(m => m.active).map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.thickness_mm}mm — {m.base_cost_mvr} MVR</option>
                ))}
              </select>
              <div className="flex gap-2 items-center">
                <input type="number" min="0.01" step="any" placeholder="Width" value={newWidth}
                  onChange={e => setNewWidth(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                <input type="number" min="0.01" step="any" placeholder="Height" value={newHeight}
                  onChange={e => setNewHeight(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
                  {(['mm', 'in', 'ft'] as const).map(u => (
                    <button key={u} type="button" onClick={() => setNewUnit(u)}
                      className={`px-2.5 py-2 text-xs font-medium transition-colors ${newUnit === u ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addExtraMaterial}
                disabled={!newMatId || !newWidth || !newHeight}
                className="w-full rounded-lg bg-zinc-900 py-2 text-sm text-white font-medium hover:bg-zinc-700 disabled:opacity-40 transition-colors">
                Add Material
              </button>
            </div>
          </div>
        )}
      </section>

      <button onClick={getQuote} disabled={!dxfAnalysis || !materialId || loading}
        className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-white font-semibold disabled:opacity-40 hover:bg-zinc-700 transition-colors">
        {loading ? 'Calculating…' : 'Get Quote →'}
      </button>
    </div>
  );
}
