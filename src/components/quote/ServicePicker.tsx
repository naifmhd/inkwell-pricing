'use client';
import { useRouter } from 'next/navigation';
import { useQuote } from './QuoteContext';

const SERVICES = [
  { id: 'laser',         label: 'Laser Cutting',     desc: 'Upload a DXF file for custom laser cutting',        icon: '✂️' },
  { id: 'sticker',       label: 'Sticker Cutting',   desc: 'Custom cut stickers from DXF dimensions',            icon: '🏷️' },
  { id: 'sticker_print', label: 'Sticker Printing',  desc: 'Full-colour sticker printing (no cut)',               icon: '🖨️' },
  { id: 'canvas',        label: 'Canvas Printing',   desc: 'Large-format canvas prints',                          icon: '🖼️' },
  { id: 'sunboard',      label: 'Sunboard',          desc: 'Rigid sunboard panels in 3mm or 6mm',                 icon: '📋' },
];

export function ServicePicker() {
  const { set } = useQuote();
  const router = useRouter();

  function pick(id: string) {
    set({ service: id, dxfAnalysis: null, result: null });
    router.push(`/quote/${id}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SERVICES.map(s => (
        <button
          key={s.id}
          onClick={() => pick(s.id)}
          className="flex items-start gap-4 rounded-xl border bg-white p-5 text-left shadow-sm hover:border-zinc-400 hover:shadow-md transition-all"
        >
          <span className="text-3xl">{s.icon}</span>
          <div>
            <p className="font-semibold text-zinc-900">{s.label}</p>
            <p className="text-sm text-zinc-500 mt-1">{s.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
