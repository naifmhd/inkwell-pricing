'use client';
import { useEffect, useState } from 'react';

interface Addon { id: number; service: string; label: string; price_mvr: number; price_type: string; active: number; group_key: string | null; }

const SERVICES = ['laser', 'sticker', 'sticker_print', 'canvas', 'sunboard', 'all'];
const GROUPS = [{ value: '', label: 'None' }, { value: 'spray', label: 'Spray Paint' }];

const emptyForm = { service: 'laser', label: '', price_mvr: 0, price_type: 'fixed', group_key: '' };

interface ModalForm { service: string; label: string; price_mvr: number; price_type: string; group_key: string; }

function AddonModal({ initial, title, onSave, onClose }: {
  initial: ModalForm;
  title: string;
  onSave: (f: ModalForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ModalForm>(initial);
  const inputCls = 'block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Service</label>
              <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} className={inputCls}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Group</label>
              <select value={form.group_key} onChange={e => setForm(f => ({ ...f, group_key: e.target.value }))} className={inputCls}>
                {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Label</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={inputCls} placeholder="e.g. Gold spray" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Price (MVR)</label>
              <input type="number" value={form.price_mvr} onChange={e => setForm(f => ({ ...f, price_mvr: Number(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Price type</label>
              <select value={form.price_type} onChange={e => setForm(f => ({ ...f, price_type: e.target.value }))} className={inputCls}>
                <option value="fixed">Fixed</option>
                <option value="per_sqft">Per sqft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={() => onSave(form)}
            className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
            Save
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [modal, setModal] = useState<{ mode: 'add' } | { mode: 'edit'; addon: Addon } | null>(null);

  async function reload() { setAddons(await fetch('/api/admin/addons').then(r => r.json())); }
  useEffect(() => { reload(); }, []);

  async function handleSave(form: ModalForm) {
    if (modal?.mode === 'edit') {
      await fetch(`/api/admin/addons/${modal.addon.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, group_key: form.group_key || null }),
      });
    } else {
      await fetch('/api/admin/addons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, group_key: form.group_key || null }),
      });
    }
    setModal(null);
    reload();
  }

  async function remove(id: number) {
    await fetch(`/api/admin/addons/${id}`, { method: 'DELETE' });
    reload();
  }

  async function toggle(a: Addon) {
    await fetch(`/api/admin/addons/${a.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: a.active ? 0 : 1 }),
    });
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Add-ons</h2>
        <button onClick={() => setModal({ mode: 'add' })}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
          + Add New
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr className="text-left text-zinc-500 text-xs">
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {addons.map(a => (
              <tr key={a.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-500">{a.service}</td>
                <td className="px-4 py-3 font-medium">{a.label}</td>
                <td className="px-4 py-3 text-right">{a.price_mvr} MVR</td>
                <td className="px-4 py-3 text-zinc-500">{a.price_type}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{a.group_key ?? '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(a)}
                    className={`text-xs px-2 py-1 rounded ${a.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {a.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => setModal({ mode: 'edit', addon: a })} className="text-xs text-zinc-500 hover:text-zinc-800">Edit</button>
                  <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AddonModal
          title={modal.mode === 'add' ? 'Add New Add-on' : 'Edit Add-on'}
          initial={modal.mode === 'edit'
            ? { service: modal.addon.service, label: modal.addon.label, price_mvr: modal.addon.price_mvr, price_type: modal.addon.price_type, group_key: modal.addon.group_key ?? '' }
            : emptyForm
          }
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
