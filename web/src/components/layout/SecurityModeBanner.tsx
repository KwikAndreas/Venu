import { TriangleAlert } from 'lucide-react';

/** Pita peringatan mode before (DESIGN.md §5). Hanya dirender bila VITE_SECURITY_MODE=before. */
export function SecurityModeBanner() {
  return (
    <div role="status" className="stripes-warning">
      <p className="type-label mx-auto flex w-fit items-center gap-2 bg-ink px-3 py-1.5 text-warning">
        <TriangleAlert className="size-4" aria-hidden />
        Mode before — rentan, hanya untuk pengujian lokal
      </p>
    </div>
  );
}
