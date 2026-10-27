import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CompareContext, MAX_COMPARE, type CompareItem } from './compare-context.ts';

const STORAGE_KEY = 'venu.compare';

function readStored(): CompareItem[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as CompareItem[]).slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

/** Pilihan "Bandingkan" bertahan selama tab browser terbuka (sessionStorage). */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(readStored);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((item: CompareItem) => {
    setItems((current) => {
      if (current.some((existing) => existing.id === item.id)) {
        return current.filter((existing) => existing.id !== item.id);
      }
      return current.length >= MAX_COMPARE ? current : [...current, item];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      isSelected: (id: number) => items.some((item) => item.id === id),
      isFull: items.length >= MAX_COMPARE,
      toggle,
      remove,
      clear,
    }),
    [items, toggle, remove, clear],
  );

  return <CompareContext value={value}>{children}</CompareContext>;
}
