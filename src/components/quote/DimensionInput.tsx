'use client';
import { useState } from 'react';
import { useQuote } from './QuoteContext';

type Unit = 'mm' | 'in' | 'ft';

const UNITS: Unit[] = ['mm', 'in', 'ft'];
const TO_MM: Record<Unit, number> = { mm: 1, in: 25.4, ft: 304.8 };

function toMm(value: number, unit: Unit) {
  return value * TO_MM[unit];
}

function fromMm(mm: number, unit: Unit) {
  return +(mm / TO_MM[unit]).toFixed(unit === 'mm' ? 0 : 4);
}

export function DimensionInput() {
  const { widthMm, heightMm, set } = useQuote();
  const [unit, setUnit] = useState<Unit>('ft');
  const [widthRaw, setWidthRaw] = useState(widthMm ? String(fromMm(widthMm, 'ft')) : '');
  const [heightRaw, setHeightRaw] = useState(heightMm ? String(fromMm(heightMm, 'ft')) : '');

  function handleUnit(next: Unit) {
    setUnit(next);
    if (widthMm) setWidthRaw(String(fromMm(widthMm, next)));
    if (heightMm) setHeightRaw(String(fromMm(heightMm, next)));
  }

  function handleWidth(val: string) {
    setWidthRaw(val);
    const n = parseFloat(val);
    set({ widthMm: n > 0 ? toMm(n, unit) : null });
  }

  function handleHeight(val: string) {
    setHeightRaw(val);
    const n = parseFloat(val);
    set({ heightMm: n > 0 ? toMm(n, unit) : null });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700">Dimensions</span>
        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
          {UNITS.map(u => (
            <button
              key={u} type="button"
              onClick={() => handleUnit(u)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${unit === u ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 mb-1">Width</label>
          <input
            type="number" min="0.001" step="any" value={widthRaw}
            onChange={e => handleWidth(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">Height</label>
          <input
            type="number" min="0.001" step="any" value={heightRaw}
            onChange={e => handleHeight(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="0"
          />
        </div>
      </div>
      {widthMm && heightMm && (
        <p className="text-xs text-zinc-400">{widthMm} × {heightMm} mm</p>
      )}
    </div>
  );
}
