import { Building2, Check, ChevronLeft, Clock, MapPin, SearchX } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { SportBadge } from '../../components/ui/Badge.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { Container } from '../../components/ui/Layout.tsx';
import { RatingSummary } from '../../components/venue/StarRating.tsx';
import { VenuePhoto } from '../../components/venue/VenuePhoto.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { MAX_DAYS_AHEAD } from '../../lib/booking-rules.ts';
import { addDays, todayInJakarta } from '../../lib/format.ts';
import type { VenueDetail } from '../../lib/types.ts';
import { BookingPanel } from './BookingPanel.tsx';
import { VenueReviews } from './VenueReviews.tsx';

function useBookingDate(): [string, (tanggal: string) => void] {
  const [params, setParams] = useSearchParams();
  const today = todayInJakarta();
  const requested = params.get('tanggal');
  const valid =
    requested !== null && requested >= today && requested <= addDays(today, MAX_DAYS_AHEAD);

  const setTanggal = (tanggal: string) => {
    const next = new URLSearchParams(params);
    next.set('tanggal', tanggal);
    setParams(next, { replace: true });
  };
  return [valid ? requested : today, setTanggal];
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

export function VenueDetailPage() {
  const { id } = useParams();
  const [tanggal, setTanggal] = useBookingDate();
  const { data, error, reload } = useApi<{ venue: VenueDetail }>(`/venues/${id}`);

  if (error?.status === 404) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={SearchX}
          title="Lapangan tidak ditemukan"
          description="Lapangan ini mungkin sudah dihapus."
          action={<ButtonLink to="/cari">Cari lapangan lain</ButtonLink>}
        />
      </Container>
    );
  }

  const venue = data?.venue;

  return (
    <Container className="py-8">
      <Link
        to="/cari"
        className="mb-6 inline-flex h-11 items-center gap-1 text-sm font-medium text-muted hover:text-navy-900"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Kembali ke pencarian
      </Link>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !venue ? (
        <DetailSkeleton />
      ) : (
        // Satu panel booking untuk semua ukuran layar: di mobile tampil setelah info lapangan,
        // di desktop menempati kolom kanan sepanjang halaman.
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:grid-rows-[auto_1fr]">
          <div className="space-y-8 lg:col-start-1 lg:row-start-1">
            <VenuePhoto
              fotoUrl={venue.foto_url}
              nama={venue.nama}
              sport={venue.jenis_olahraga}
              className="rounded-lg border border-line"
            />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <SportBadge sport={venue.jenis_olahraga} />
                <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
              </div>
              <h1 className="type-h1 mt-3 text-navy-900">{venue.nama}</h1>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {venue.alamat}, {venue.kota}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0" aria-hidden />
                  Buka {venue.jam_buka}–{venue.jam_tutup} WIB
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0" aria-hidden />
                  Dikelola oleh {venue.nama_pemilik}
                </li>
              </ul>
            </div>

            {venue.deskripsi && (
              <section aria-labelledby="judul-deskripsi">
                <h2 id="judul-deskripsi" className="type-h3 text-navy-900">
                  Tentang lapangan
                </h2>
                <p className="mt-2 text-navy-900">{venue.deskripsi}</p>
              </section>
            )}

            {venue.fasilitas.length > 0 && (
              <section aria-labelledby="judul-fasilitas">
                <h2 id="judul-fasilitas" className="type-h3 text-navy-900">
                  Fasilitas
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {venue.fasilitas.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-navy-900">
                      <span className="flex size-6 items-center justify-center rounded-full bg-gold-100">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <BookingPanel venue={venue} tanggal={tanggal} onTanggalChange={setTanggal} />
          </aside>

          <div className="lg:col-start-1 lg:row-start-2">
            <VenueReviews venueId={venue.id} onChanged={reload} />
          </div>
        </div>
      )}
    </Container>
  );
}
