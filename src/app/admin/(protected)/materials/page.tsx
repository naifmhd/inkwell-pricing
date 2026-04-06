'use client';
import { useEffect, useState } from 'react';

interface ColorRate { id: number; material_id: number; color_key: string; operation: string; rate_mvr_mm: number; }
interface Material { id: number; name: string; thickness_mm: number; base_cost_mvr: number; active: number; colorRates: ColorRate[]; }

const OPS = ['cut', 'engrave', 'score'];
const DEFAULT_COLORS = ['7', 'ByLayer', '250', '2', '6'];

function AddMaterialModal({ onSave, onClose }: { onSave: (f: { name: string; thickness_mm: number; base_cost_mvr: number }) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', thickness_mm: 3, base_cost_mvr: 0 });
  const inputCls = 'block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Add Material</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Clear Acrylic" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Thickness (mm)</label>
              <input type="number" step="0.5" value={form.thickness_mm} onChange={e => setForm(f => ({ ...f, thickness_mm: Number(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Base cost (MVR)</label>
              <input type="number" step="1" value={form.base_cost_mvr} onChange={e => setForm(f => ({ ...f, base_cost_mvr: Number(e.target.value) }))} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={() => onSave(form)} className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">Add</button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rateForm, setRateForm] = useState({ color_key: '7', operation: 'cut', rate_mvr_mm: 0.1 });

  async function reload() {
    const data = await fetch('/api/admin/materials').then(r => r.json());
    setMaterials(data);
  }
  useEffect(() => { reload(); }, []);

  async function save(form: { name: string; thickness_mm: number; base_cost_mvr: number }) {
    await fetch('/api/admin/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAddModal(false);
    reload();
  }

  async function remove(id: number) {
    await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
    reload();
  }

  async function toggleActive(m: Material) {
    await fetch(`/api/admin/materials/${m.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: m.active ? 0 : 1 }) });
    reload();
  }

  async function updateBase(id: number, val: number) {
    await fetch(`/api/admin/materials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base_cost_mvr: val }) });
    reload();
  }

  async function upsertRate(materialId: number) {
    await fetch('/api/admin/color-rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rateForm, material_id: materialId }) });
    reload();
  }

  async function deleteRate(id: number) {
    await fetch('/api/admin/color-rates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    reload();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Materials</h2>
        <button onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
          + Add Material
        </button>
      </div>

      {showAddModal && <AddMaterialModal onSave={save} onClose={() => setShowAddModal(false)} />}

      {/* Materials list */}
      {materials.map(m => (
        <div key={m.id} className="bg-white rounded-xl border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-900">{m.name} — {m.thickness_mm}mm</p>
              <p className="text-sm text-zinc-500">Base cost: {m.base_cost_mvr} MVR</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(editing === m.id ? null : m.id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-400">
                {editing === m.id ? 'Done' : 'Edit rates'}
              </button>
              <button onClick={() => toggleActive(m)}
                className={`text-sm px-3 py-1.5 rounded-lg ${m.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {m.active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => remove(m.id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>

          {/* Color rates table */}
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-zinc-500 text-xs"><th className="pb-1">Color key</th><th className="pb-1">Operation</th><th className="pb-1 text-right">Rate (MVR/mm)</th><th /></tr></thead>
            <tbody>
              {m.colorRates.map(r => (
                <tr key={r.id} className="border-b border-zinc-50">
                  <td className="py-1">{r.color_key}</td>
                  <td className="py-1 capitalize">{r.operation}</td>
                  <td className="py-1 text-right">{r.rate_mvr_mm}</td>
                  <td className="py-1 text-right">
                    <button onClick={() => deleteRate(r.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editing === m.id && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Add / update rate</p>
              <div className="flex gap-2 items-end">
                <div>
                  <label className="text-xs text-zinc-500">Color key</label>
                  <select value={rateForm.color_key} onChange={e => setRateForm(f => ({ ...f, color_key: e.target.value }))}
                    className="block w-28 rounded border px-2 py-1.5 text-sm">
                    {DEFAULT_COLORS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Operation</label>
                  <select value={rateForm.operation} onChange={e => setRateForm(f => ({ ...f, operation: e.target.value }))}
                    className="block w-28 rounded border px-2 py-1.5 text-sm">
                    {OPS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Rate MVR/mm</label>
                  <input type="number" step="0.001" value={rateForm.rate_mvr_mm}
                    onChange={e => setRateForm(f => ({ ...f, rate_mvr_mm: Number(e.target.value) }))}
                    className="block w-24 rounded border px-2 py-1.5 text-sm" />
                </div>
                <button onClick={() => upsertRate(m.id)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white">Save</button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-zinc-500">Base cost:</span>
                <input type="number" defaultValue={m.base_cost_mvr} onBlur={e => updateBase(m.id, Number(e.target.value))}
                  className="w-24 rounded border px-2 py-1 text-sm" />
                <span className="text-xs text-zinc-400">MVR (blur to save)</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
