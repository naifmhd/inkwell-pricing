'use client';
import { useState } from 'react';
import type { DbStandardColor } from '@/lib/db/queries';

const OP_COLORS: Record<string, string> = {
  cut: 'bg-blue-100 text-blue-700',
  engrave: 'bg-orange-100 text-orange-700',
  score: 'bg-green-100 text-green-700',
};

interface Props {
  standard: DbStandardColor[];
}

export function ColorGuide({ standard }: Props) {
  const [open, setOpen] = useState(true);

  if (standard.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <span>Color Guide — Use these colors when exporting your DXF</span>
        <span className="text-zinc-400 text-xs">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="border-t border-zinc-200 px-4 py-3 flex flex-wrap gap-3">
          {standard.map(sc => (
            <div key={sc.color_key} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                style={{ backgroundColor: sc.hex }}
              />
              <span className="text-zinc-700">{sc.label} <span className="text-zinc-400 text-xs">(ACI {sc.color_key})</span></span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${OP_COLORS[sc.operation]}`}>{sc.operation}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
