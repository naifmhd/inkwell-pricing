'use client';
import { useEffect, useState } from 'react';

interface StandardColor {
  id: number;
  color_key: string;
  operation: 'cut' | 'engrave' | 'score';
  label: string;
  hex: string;
}

const OPERATIONS = ['cut', 'engrave', 'score'] as const;

const OP_COLORS: Record<string, string> = {
  cut: 'bg-blue-100 text-blue-700',
  engrave: 'bg-orange-100 text-orange-700',
  score: 'bg-green-100 text-green-700',
};

export default function StandardColorsPage() {
  const [colors, setColors] = useState<StandardColor[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newOp, setNewOp] = useState<'cut' | 'engrave' | 'score'>('cut');
  const [newHex, setNewHex] = useState('#888888');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/standard-colors').then(r => r.json()).then(setColors);
  }, []);

  async function save(sc: Omit<StandardColor, 'id'>) {
    setSaving(true);
    const res = await fetch('/api/admin/standard-colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sc),
    });
    setColors(await res.json());
    setSaving(false);
  }

  async function remove(id: number) {
    const res = await fetch('/api/admin/standard-colors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setColors(await res.json());
  }

  async function addNew() {
    if (!newKey || !newLabel) return;
    await save({ color_key: newKey, operation: newOp, label: newLabel, hex: newHex });
    setNewKey(''); setNewLabel(''); setNewOp('cut'); setNewHex('#888888');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Color Standard</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Define which DXF colors map to which operations. Uploaded files are validated against this standard.
        </p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Swatch</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">ACI Color Key</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Label</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Operation</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Hex</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {colors.map(sc => (
              <tr key={sc.id} className="border-b hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <span
                    className="inline-block w-5 h-5 rounded border border-zinc-200"
                    style={{ backgroundColor: sc.hex }}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-zinc-700">{sc.color_key}</td>
                <td className="px-4 py-3 text-zinc-700">{sc.label}</td>
                <td className="px-4 py-3">
                  <select
                    value={sc.operation}
                    onChange={e => save({ color_key: sc.color_key, operation: e.target.value as 'cut'|'engrave'|'score', label: sc.label, hex: sc.hex })}
                    className="rounded border border-zinc-200 px-2 py-1 text-xs focus:outline-none"
                    disabled={saving}
                  >
                    {OPERATIONS.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium ${OP_COLORS[sc.operation]}`}>{sc.operation}</span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="color"
                    value={sc.hex}
                    onChange={e => save({ color_key: sc.color_key, operation: sc.operation, label: sc.label, hex: e.target.value })}
                    className="w-8 h-7 rounded border border-zinc-200 cursor-pointer"
                    disabled={saving}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(sc.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add new row */}
        <div className="border-t p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700">Add standard color</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">ACI Color Key</label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Label</label>
              <input
                type="text"
                placeholder="e.g. Red"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Operation</label>
              <select
                value={newOp}
                onChange={e => setNewOp(e.target.value as 'cut'|'engrave'|'score')}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {OPERATIONS.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Color</label>
              <input
                type="color"
                value={newHex}
                onChange={e => setNewHex(e.target.value)}
                className="w-10 h-9 rounded-lg border border-zinc-200 cursor-pointer"
              />
            </div>
            <button
              onClick={addNew}
              disabled={!newKey || !newLabel || saving}
              className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
