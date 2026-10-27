import { ArrowLeft, Scale, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { Container } from '../components/ui/Layout.tsx';
import { VenuePhoto } from '../components/venue/VenuePhoto.tsx';
import { api, toApiError } from '../lib/api.ts';
import { formatRating, formatRupiah, relativeDay, todayInJakarta } from '../lib/format.ts';
import type { VenueDetail, VenueSlots } from '../lib/types.ts';
import { useCompare } from './compare-context.ts';

const COMPARE_HOURS = 2;

type Compared = { venue: VenueDetail; freeSlots: string[] };

type LoadState =
  | { key: string; status: 'ready'; items: Compared[] }
  | { key: string; status: 'error'; message: string };

/** Detail + jam kosong untuk setiap lapangan yang dipilih, diambil bersamaan. */
function useComparedVenues(ids: number[], tanggal: string, mulai: string): LoadState | undefined {
  const idsKey = ids.join(',');
  const key = `${idsKey}|${tanggal}|${mulai}`;
  const [state, setState] = useState<LoadState>();

  useEffect(() => {
    let cancelled = false;
    const requestKey = `${idsKey}|${tanggal}|${mulai}`;
    Promise.all(
      idsKey
        .split(',')
        .filter(Boolean)
        .map(async (id) => {
          const [{ venue }, slots] = await Promise.all([
            api.get<{ venue: VenueDetail }>(`/venues/${id}`),
            api.get<VenueSlots>(`/venues/${id}/slots?tanggal=${tanggal}`),
          ]);
          const freeSlots = slots.slots
            .filter((slot) => slot.tersedia && (!mulai || slot.jam_mulai >= mulai))
            .map((slot) => slot.jam_mulai);
          return { venue, freeSlots };
        }),
    ).then(
      (items) => !cancelled && setState({ key: requestKey, status: 'ready', items }),
      (error: unknown) =>
        !cancelled &&
        setState({ key: requestKey, status: 'error', message: toApiError(error).message }),
    );
    return () => {
      cancelled = true;
    };
  }, [idsKey, tanggal, mulai]);

  return state?.key === key ? state : undefined;
}

function Best({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="border-t border-line">
      <th
        scope="row"
        className="w-44 px-6 py-4 text-left align-top text-sm font-semibold text-muted"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function CompareTable({
  items,
  tanggal,
  dayLabel,
  onRemove,
}: {
  items: Compared[];
  tanggal: string;
  dayLabel: string;
  onRemove: (id: number) => void;
}) {
  const venues = items.map((item) => item.venue);
  const cheapest = Math.min(...venues.map((v) => v.harga_per_jam));
  const rated = venues.filter((v) => v.rating_rata !== null && v.jumlah_ulasan > 0);
  const topRating =
    rated.length > 1 ? Math.max(...rated.map((v) => v.rating_rata ?? 0)) : undefined;
  const mostSlots = Math.max(...items.map((item) => item.freeSlots.length));
  const facilities = [...new Set(venues.flatMap((v) => v.fasilitas))];
  const detailHref = (id: number) =>
    `/lapangan/${id}${tanggal === todayInJakarta() ? '' : `?tanggal=${tanggal}`}`;

  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-raised">
      <table className="w-full min-w-[720px] table-fixed text-sm">
        <thead>
          <tr>
            <td className="w-44" />
            {venues.map((venue) => (
              <th
                key={venue.id}
                scope="col"
                className="px-6 pb-4 pt-6 text-left align-top font-normal"
              >
                <div className="relative">
                  <VenuePhoto
                    fotoUrl={venue.foto_url}
                    nama={venue.nama}
                    sport={venue.jenis_olahraga}
                    className="aspect-video rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(venue.id)}
                    aria-label={`Hapus ${venue.nama} dari perbandingan`}
                    title="Hapus dari perbandingan"
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-[#1d1b17] shadow-soft"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-3 text-base font-bold tracking-tight text-fg">{venue.nama}</p>
                <p className="text-muted">{venue.kota}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Harga per jam">
            {venues.map((v) => (
              <td key={v.id} className="px-6 py-4 align-top">
                <span className="text-base font-bold text-fg">{formatRupiah(v.harga_per_jam)}</span>
                {v.harga_per_jam === cheapest && <Best>Termurah</Best>}
              </td>
            ))}
          </Row>
          <Row label={`Total ${COMPARE_HOURS} jam`}>
            {venues.map((v) => (
              <td key={v.id} className="px-6 py-4 align-top text-fg">
                {formatRupiah(v.harga_per_jam * COMPARE_HOURS)}
              </td>
            ))}
          </Row>
          <Row label="Rating">
            {venues.map((v) => (
              <td key={v.id} className="px-6 py-4 align-top">
                {v.rating_rata !== null && v.jumlah_ulasan > 0 ? (
                  <>
                    <span className="text-base font-bold text-fg">
                      ★ {formatRating(v.rating_rata)}
                    </span>{' '}
                    <span className="text-muted">({v.jumlah_ulasan} ulasan)</span>
                    {v.rating_rata === topRating && <Best>Tertinggi</Best>}
                  </>
                ) : (
                  <span className="text-muted">Belum ada ulasan</span>
                )}
              </td>
            ))}
          </Row>
          <Row label={`Kosong ${dayLabel}`}>
            {items.map(({ venue, freeSlots }) => (
              <td key={venue.id} className="px-6 py-4 align-top">
                {freeSlots.length ? (
                  <div className="flex flex-wrap gap-1">
                    {freeSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-lg bg-accent-soft px-2 py-0.5 font-semibold tabular-nums text-accent"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">Penuh</span>
                )}
                {items.length > 1 && freeSlots.length > 0 && freeSlots.length === mostSlots && (
                  <p className="mt-2">
                    <Best>Paling fleksibel</Best>
                  </p>
                )}
              </td>
            ))}
          </Row>
          <Row label="Jam buka">
            {venues.map((v) => (
              <td key={v.id} className="px-6 py-4 align-top tabular-nums text-fg">
                {v.jam_buka}–{v.jam_tutup}
              </td>
            ))}
          </Row>
          {facilities.map((facility) => (
            <Row key={facility} label={facility}>
              {venues.map((v) => (
                <td key={v.id} className="px-6 py-4 align-top">
                  {v.fasilitas.includes(facility) ? (
                    <span className="font-semibold text-accent">✓ Ada</span>
                  ) : (
                    <span className="text-muted" aria-label="Tidak ada">
                      —
                    </span>
                  )}
                </td>
              ))}
            </Row>
          ))}
          <tr className="border-t border-line">
            <td />
            {venues.map((v) => (
              <td key={v.id} className="px-6 py-5">
                <ButtonLink to={detailHref(v.id)} variant="secondary" size="sm">
                  Pilih jadwal
                </ButtonLink>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ComparePage() {
  const { items, remove } = useCompare();
  const [params] = useSearchParams();
  const today = todayInJakarta();
  const tanggal = params.get('tanggal') ?? today;
  const mulai = params.get('mulai') ?? '';
  const ids = items.map((item) => item.id);
  const state = useComparedVenues(ids, tanggal, mulai);
  const backHref = `/${params.toString() ? `?${params}` : ''}`;
  const dayLabel = mulai
    ? `${relativeDay(tanggal, today)} mulai ${mulai}`
    : relativeDay(tanggal, today);

  return (
    <Container className="py-8 sm:py-10">
      <Link
        to={backHref}
        className="inline-flex h-10 items-center gap-2 text-sm font-semibold text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke hasil
      </Link>
      <h1 className="type-h1 mt-2 text-fg">Bandingkan lapangan</h1>
      <p className="mt-1 text-muted">Nilai terbaik di setiap baris ditandai hijau.</p>

      <div className="mt-8">
        {ids.length < 2 ? (
          <EmptyState
            icon={Scale}
            title="Pilih minimal 2 lapangan"
            description="Tekan “Bandingkan” di kartu lapangan untuk menambahkannya ke sini."
            action={<ButtonLink to={backHref}>Cari lapangan</ButtonLink>}
          />
        ) : !state ? (
          <Skeleton className="h-[480px] rounded-3xl" />
        ) : state.status === 'error' ? (
          <ErrorState message={state.message} />
        ) : (
          <CompareTable
            items={state.items}
            tanggal={tanggal}
            dayLabel={dayLabel}
            onRemove={remove}
          />
        )}
      </div>
    </Container>
  );
}
