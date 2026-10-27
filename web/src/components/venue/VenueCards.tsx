import { Check, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { MAX_COMPARE, useCompare } from '../../compare/compare-context.ts';
import { formatRupiah } from '../../lib/format.ts';
import { decisionBadges } from '../../lib/decision-badges.ts';
import type { Venue } from '../../lib/types.ts';
import { Skeleton } from '../ui/Feedback.tsx';
import { RatingSummary } from './StarRating.tsx';
import { VenuePhoto } from './VenuePhoto.tsx';

const MAX_VISIBLE_SLOTS = 3;
function CompareToggle({ venue }: { venue: Venue }) {
  const { isSelected, isFull, toggle } = useCompare();
  const selected = isSelected(venue.id);
  const blocked = !selected && isFull;
  return (
    <button
      type="button"
      onClick={() =>
        toggle({
          id: venue.id,
          nama: venue.nama,
          jenis_olahraga: venue.jenis_olahraga,
          foto_url: venue.foto_url,
        })
      }
      disabled={blocked}
      aria-pressed={selected}
      title={blocked ? `Maksimal ${MAX_COMPARE} lapangan untuk dibandingkan` : undefined}
      className={`absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        selected ? 'bg-accent text-on-accent' : 'bg-white/95 text-[#1d1b17] hover:bg-white'
      }`}
    >
      {selected ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Plus className="size-3.5" aria-hidden />
      )}
      {selected ? 'Dibandingkan' : 'Bandingkan'}
      <span className="sr-only"> {venue.nama}</span>
    </button>
  );
}

function FreeSlots({ slots }: { slots: string[] }) {
  if (slots.length === 0) {
    return <p className="text-[13px] text-muted">Penuh pada jam ini</p>;
  }
  const extra = slots.length - MAX_VISIBLE_SLOTS;
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted">Jam kosong</p>
      <div className="flex flex-wrap gap-1">
        {slots.slice(0, MAX_VISIBLE_SLOTS).map((slot) => (
          <span
            key={slot}
            className="rounded-lg bg-accent-soft px-2 py-0.5 text-[13px] font-semibold tabular-nums text-accent"
          >
            {slot}
          </span>
        ))}
        {extra > 0 && (
          <span className="rounded-lg bg-accent-soft px-2 py-0.5 text-[13px] font-semibold text-accent">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}

type VenueCardProps = {
  venue: Venue;
  badge?: string;
  tanggal?: string;
};

/** Kartu foto (gaya B) dengan informasi pembanding yang sejajar (gaya A). */
export function VenueCard({ venue, badge, tanggal }: VenueCardProps) {
  const href = tanggal ? `/lapangan/${venue.id}?tanggal=${tanggal}` : `/lapangan/${venue.id}`;
  const fasilitas = venue.fasilitas.slice(0, 2);

  return (
    <article className="group relative">
      <Link to={href} className="block rounded-[18px]">
        <VenuePhoto
          fotoUrl={venue.foto_url}
          nama={venue.nama}
          sport={venue.jenis_olahraga}
          className="aspect-[16/10] rounded-[18px] transition-opacity duration-200 group-hover:opacity-90"
        />
        <div className="px-0.5 pt-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-[17px] font-bold tracking-tight text-fg">{venue.nama}</h3>
            <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">
            {[venue.kota, ...fasilitas].join(' · ')}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
            {venue.slot_kosong ? <FreeSlots slots={venue.slot_kosong} /> : <span />}
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted">per jam</p>
              <p className="text-lg font-bold tracking-tight text-fg">
                {formatRupiah(venue.harga_per_jam)}
              </p>
            </div>
          </div>
        </div>
      </Link>
      {badge && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-raised px-2.5 py-1 text-xs font-bold text-fg shadow-soft">
          {badge}
        </span>
      )}
      <CompareToggle venue={venue} />
    </article>
  );
}

const GRID_CLASSES = 'grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3';

export function VenueGrid({ venues, tanggal }: { venues: Venue[]; tanggal?: string }) {
  const badges = decisionBadges(venues);
  return (
    <div className={GRID_CLASSES}>
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} badge={badges.get(venue.id)} tanggal={tanggal} />
      ))}
    </div>
  );
}

export function VenueGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES} aria-label="Memuat lapangan">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[16/10] rounded-[18px]" />
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-5 h-10" />
        </div>
      ))}
    </div>
  );
}
