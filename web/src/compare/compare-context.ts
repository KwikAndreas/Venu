import { createContext, useContext } from 'react';
import type { Sport } from '../lib/types.ts';

export const MAX_COMPARE = 3;

/** Data ringkas lapangan yang dipilih, cukup untuk baki "Bandingkan". */
export type CompareItem = {
  id: number;
  nama: string;
  jenis_olahraga: Sport;
  foto_url: string | null;
};

export type CompareContextValue = {
  items: CompareItem[];
  isSelected: (id: number) => boolean;
  isFull: boolean;
  toggle: (item: CompareItem) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const value = useContext(CompareContext);
  if (!value) throw new Error('useCompare harus dipakai di dalam <CompareProvider>');
  return value;
}
