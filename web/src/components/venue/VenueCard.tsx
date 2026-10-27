import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { formatRupiah } from '../../lib/format.ts';
import type { Venue } from '../../lib/types.ts';
import { SportBadge } from '../ui/Badge.tsx';
import { RatingSummary } from './StarRating.tsx';
import { VenuePhoto } from './VenuePhoto.tsx';

/** Kartu lapangan: foto 16:9, judul Playfair, badge olahraga, harga tebal. Naik 2px saat hover. */
export function VenueCard({ venue, tanggal }: { venue: Venue; tanggal?: string }) {
  const href = tanggal ? `/lapangan/${venue.id}?tanggal=${tanggal}` : `/lapangan/${venue.id}`;
  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-raised"
    >
      <VenuePhoto fotoUrl={venue.foto_url} nama={venue.nama} sport={venue.jenis_olahraga} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <SportBadge sport={venue.jenis_olahraga} />
          <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
        </div>
        <h3 className="font-display text-xl font-semibold text-navy-900">{venue.nama}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {venue.kota}
        </p>
        <p className="mt-auto border-t border-line pt-3 text-sm text-muted">
          <span className="text-lg font-bold text-navy-900">
            {formatRupiah(venue.harga_per_jam)}
          </span>{' '}
          / jam
        </p>
      </div>
    </Link>
  );
}
