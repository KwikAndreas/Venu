import { TriangleAlert } from 'lucide-react';

/** Pita peringatan mode before (DESIGN.md §5). Hanya dirender bila VITE_SECURITY_MODE=before. */
export function SecurityModeBanner() {
  return (
    <div role="status" className="bg-warning-soft text-warning">
      <p className="mx-auto flex max-w-[1160px] items-center justify-center gap-2 px-5 py-2 text-[13px] font-semibold">
        <TriangleAlert className="size-4 shrink-0" aria-hidden />
        Mode before aktif: celah keamanan sengaja dinyalakan. Hanya untuk pengujian lokal.
      </p>
    </div>
  );
}
