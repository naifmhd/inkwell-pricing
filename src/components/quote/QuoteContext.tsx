'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { DxfAnalysis } from '@/lib/dxf/types';
import type { QuoteResult } from '@/lib/pricing/types';

export interface ExtraMaterial {
  uid: string;
  materialId: number;
  widthMm: number;
  heightMm: number;
}

interface QuoteState {
  service: string | null;
  dxfAnalysis: DxfAnalysis | null;
  materialId: number | null;
  addonIds: number[];
  widthMm: number | null;
  heightMm: number | null;
  sunboardThickness: 3 | 6;
  result: QuoteResult | null;
  sprayAddonId: number | null;
  extraMaterials: ExtraMaterial[];
}

interface QuoteContextType extends QuoteState {
  set: (patch: Partial<QuoteState>) => void;
  reset: () => void;
}

const initial: QuoteState = {
  service: null, dxfAnalysis: null, materialId: null, addonIds: [],
  widthMm: null, heightMm: null, sunboardThickness: 3, result: null,
  sprayAddonId: null, extraMaterials: [],
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuoteState>(initial);
  const set = (patch: Partial<QuoteState>) => setState(s => ({ ...s, ...patch }));
  const reset = () => setState(initial);
  return <QuoteContext.Provider value={{ ...state, set, reset }}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used inside QuoteProvider');
  return ctx;
}
