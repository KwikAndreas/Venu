import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { formatPriceShort } from '../../lib/format.ts';
import type { Venue } from '../../lib/types.ts';
import { SportBadge } from '../ui/Badge.tsx';
import { Skeleton } from '../ui/Feedback.tsx';
import { RatingSummary } from './StarRating.tsx';
import { VenuePhoto } from './VenuePhoto.tsx';

type VenueRowProps = { venue: Venue; index: number; tanggal?: string };

/**
 * Baris "fixture" (DESIGN.md §5): nomor urut, foto/kode olahraga, nama kapital, harga besar.
 * Hover menyalakan garis kiri dan nomor dengan Volt.
 */
function VenueRow({ venue, index, tanggal }: VenueRowProps) {
  const href = tanggal ? `/lapangan/${venue.id}?tanggal=${tanggal}` : `/lapangan/${venue.id}`;
  return (
    <Link
      to={href}
      className="group grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3 rounded-lg border border-l-[3px] border-line border-l-line bg-surface p-3 transition-colors duration-150 ease-out hover:border-l-volt hover:bg-surface-2 sm:grid-cols-[2.5rem_9rem_1fr_auto_1.5rem] sm:gap-x-6 sm:p-4"
    >
      <span className="type-score hidden text-muted/40 transition-colors group-hover:text-volt sm:block">
        {String(index + 1).padStart(2, '0')}
      </span>
      <VenuePhoto
        fotoUrl={venue.foto_url}
        nama={venue.nama}
        sport={venue.jenis_olahraga}
        compact
        className="rounded-md"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <SportBadge sport={venue.jenis_olahraga} />
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden />
            {venue.kota}
          </span>
        </div>
        <h3 className="type-h3 mt-1.5 truncate text-fg">{venue.nama}</h3>
        <div className="mt-1">
          <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
        </div>
      </div>
      <div className="col-span-2 flex items-baseline justify-between border-t border-line pt-3 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <p className="type-label text-muted sm:order-last">per jam</p>
        <p className="type-score text-fg">
          <span className="mr-1 text-base text-muted">Rp</span>
          {formatPriceShort(venue.harga_per_jam)}
        </p>
      </div>
      <ArrowUpRight
        className="hidden size-6 text-muted transition duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-volt sm:block"
        aria-hidden
      />
    </Link>
  );
}

export function VenueList({ venues, tanggal }: { venues: Venue[]; tanggal?: string }) {
  return (
    <ol className="space-y-2">
      {venues.map((venue, index) => (
        <li key={venue.id}>
          <VenueRow venue={venue} index={index} tanggal={tanggal} />
        </li>
      ))}
    </ol>
  );
}

export function VenueListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-label="Memuat lapangan">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-lg sm:h-24" />
      ))}
    </div>
  );
}
