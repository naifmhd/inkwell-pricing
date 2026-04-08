'use client';
import { useRef, useState } from 'react';
import type { DxfAnalysis } from '@/lib/dxf/types';
import type { DbStandardColor } from '@/lib/db/queries';
import type { Operation } from '@/lib/pricing/types';

const OP_COLORS: Record<string, string> = {
  cut: 'bg-blue-100 text-blue-700',
  engrave: 'bg-orange-100 text-orange-700',
  score: 'bg-green-100 text-green-700',
};

const DEFAULT_OPS: Record<string, string> = {
  '1': 'cut', '2': 'score', '3': 'engrave', '4': 'cut', '5': 'cut',
  '6': 'score', '7': 'cut', '250': 'engrave', '251': 'engrave', '252': 'score',
  'ByLayer': 'cut',
};

export type ColorOverrides = Record<string, Operation | 'ignore'>;

interface Props {
  onAnalysed: (analysis: DxfAnalysis, overrides: ColorOverrides) => void;
  standardColors?: DbStandardColor[];
}

export function DxfUploader({ onAnalysed, standardColors = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DxfAnalysis | null>(null);
  const [overrides, setOverrides] = useState<ColorOverrides>({});
  const [warnDismissed, setWarnDismissed] = useState(false);
  const [showRemap, setShowRemap] = useState(false);

  const standardMap = new Map(standardColors.map(s => [s.color_key, s]));

  function effectiveOp(colorKey: string): string {
    if (overrides[colorKey] && overrides[colorKey] !== 'ignore') return overrides[colorKey];
    if (standardMap.has(colorKey)) return standardMap.get(colorKey)!.operation;
    return DEFAULT_OPS[colorKey] ?? 'cut';
  }

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setOverrides({});
    setWarnDismissed(false);
    setShowRemap(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/dxf/analyse', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const result: DxfAnalysis = await res.json();
      setAnalysis(result);
      onAnalysed(result, {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function setOverride(colorKey: string, val: Operation | 'ignore') {
    const next = { ...overrides, [colorKey]: val };
    setOverrides(next);
    if (analysis) onAnalysed(analysis, next);
  }

  const nonStandardColors = analysis?.nonStandardColors ?? [];
  const showWarning = analysis?.colorValidation === 'warn' && !warnDismissed;

  // Labels for non-standard colors from analysis
  const nonStandardLabels = nonStandardColors.map(key => {
    const cg = analysis?.colors.find(c => c.colorKey === key);
    return cg ? `${cg.label} (ACI ${key})` : `ACI ${key}`;
  });

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white px-6 py-8 text-center hover:border-zinc-400 transition-colors"
      >
        {loading ? (
          <p className="text-zinc-500">Analysing file…</p>
        ) : analysis ? (
          <p className="text-zinc-500 text-sm">Click to replace file</p>
        ) : (
          <>
            <p className="font-medium text-zinc-700">Drop your DXF file here</p>
            <p className="text-sm text-zinc-400 mt-1">or click to browse</p>
          </>
        )}
        <input ref={inputRef} type="file" accept=".dxf" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-800">Non-standard colors detected</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your file uses: {nonStandardLabels.join(', ')}. These colors are not in the standard scheme.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRemap(r => !r)}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              {showRemap ? 'Hide remapping' : 'Re-map colors'}
            </button>
            <button
              onClick={() => setWarnDismissed(true)}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Proceed anyway
            </button>
          </div>
          {showRemap && (
            <div className="space-y-2 pt-1">
              {nonStandardColors.map(key => {
                const cg = analysis?.colors.find(c => c.colorKey === key);
                const label = cg ? `${cg.label} (ACI ${key})` : `ACI ${key}`;
                return (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 text-amber-900">{label}</span>
                    <select
                      value={overrides[key] ?? ''}
                      onChange={e => setOverride(key, e.target.value as Operation | 'ignore')}
                      className="rounded border border-amber-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:outline-none"
                    >
                      <option value="">Use default</option>
                      <option value="cut">cut</option>
                      <option value="engrave">engrave</option>
                      <option value="score">score</option>
                      <option value="ignore">ignore</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          {/* SVG Preview */}
          <div className="bg-white flex items-center justify-center p-4 border-b border-zinc-200" style={{ minHeight: 200 }}>
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(analysis.svg)}`}
              className="max-w-full object-contain"
              style={{ maxHeight: 256 }}
              alt="DXF preview"
            />
          </div>

          {/* Stats */}
          <div className="p-4 space-y-3 bg-white">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-50 border px-3 py-2">
                <p className="text-xs text-zinc-400 mb-0.5">Size</p>
                <p className="font-medium text-zinc-800">{analysis.bb.width.toFixed(1)} × {analysis.bb.height.toFixed(1)} mm</p>
              </div>
              <div className="rounded-lg bg-zinc-50 border px-3 py-2">
                <p className="text-xs text-zinc-400 mb-0.5">Entities</p>
                <p className="font-medium text-zinc-800">{analysis.entityCount}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 border px-3 py-2">
                <p className="text-xs text-zinc-400 mb-0.5">Total path</p>
                <p className="font-medium text-zinc-800">{analysis.totalLength.toFixed(0)} mm</p>
              </div>
            </div>

            {/* Color breakdown */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-zinc-400">
                  <th className="pb-1.5 font-medium">Color</th>
                  <th className="pb-1.5 font-medium">Operation</th>
                  <th className="pb-1.5 font-medium text-right">Length (mm)</th>
                  <th className="pb-1.5 font-medium text-right">Entities</th>
                </tr>
              </thead>
              <tbody>
                {analysis.colors.map(c => {
                  const op = effectiveOp(c.colorKey);
                  const isIgnored = overrides[c.colorKey] === 'ignore';
                  const isNonStandard = nonStandardColors.includes(c.colorKey);
                  return (
                    <tr key={c.colorKey} className={`border-b border-zinc-50 ${isIgnored ? 'opacity-40' : ''}`}>
                      <td className="py-1.5 text-zinc-700">
                        {c.colorKey} — {c.label}
                        {isNonStandard && !isIgnored && (
                          <span className="ml-1 text-amber-500">⚠</span>
                        )}
                      </td>
                      <td className="py-1.5">
                        {isIgnored ? (
                          <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-400">ignored</span>
                        ) : (
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${OP_COLORS[op] ?? 'bg-zinc-100 text-zinc-600'}`}>{op}</span>
                        )}
                      </td>
                      <td className="py-1.5 text-right text-zinc-600">{c.total.toFixed(1)}</td>
                      <td className="py-1.5 text-right text-zinc-600">{c.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
