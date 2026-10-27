import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SPORT_PLACEHOLDER } from '../lib/sport-visual.ts';
import { useCompare } from './compare-context.ts';

/** Baki melayang di bawah layar selama ada lapangan yang dipilih untuk dibandingkan. */
export function CompareTray({ query }: { query: string }) {
  const { items, clear } = useCompare();
  const navigate = useNavigate();
  if (items.length === 0) return null;

  const ready = items.length >= 2;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div
        role="region"
        aria-label="Lapangan yang akan dibandingkan"
        className="pointer-events-auto flex items-center gap-3 rounded-full bg-fg py-2 pl-2.5 pr-2 text-bg shadow-soft"
      >
        <span className="flex" aria-hidden>
          {items.map((item) =>
            item.foto_url ? (
              <img
                key={item.id}
                src={item.foto_url}
                alt=""
                className="-mr-2 size-8 rounded-full border-2 border-fg object-cover"
              />
            ) : (
              <span
                key={item.id}
                className="-mr-2 size-8 rounded-full border-2 border-fg"
                style={{ background: SPORT_PLACEHOLDER[item.jenis_olahraga] }}
              />
            ),
          )}
        </span>
        <span className="ml-2 text-sm font-semibold">
          {ready ? `${items.length} lapangan dipilih` : 'Pilih 1 lapangan lagi'}
        </span>
        <button
          type="button"
          onClick={clear}
          aria-label="Kosongkan pilihan"
          title="Kosongkan pilihan"
          className="grid size-8 place-items-center rounded-full text-bg/70 hover:text-bg"
        >
          <X className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => navigate(`/bandingkan${query ? `?${query}` : ''}`)}
          className="h-9 rounded-full bg-bg px-5 text-sm font-bold text-fg transition-opacity disabled:opacity-50"
        >
          Bandingkan
        </button>
      </div>
    </div>
  );
}
