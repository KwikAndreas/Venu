import { Search, SearchX } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { ActiveBookingStrip } from '../bookings/ActiveBookingStrip.tsx';
import { CompareTray } from '../compare/CompareTray.tsx';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState } from '../components/ui/Feedback.tsx';
import { Container } from '../components/ui/Layout.tsx';
import { PILL_CLASSES } from '../components/ui/styles.ts';
import { VenueGrid, VenueGridSkeleton } from '../components/venue/VenueCards.tsx';
import { useApi } from '../hooks/useApi.ts';
import { MAX_DAYS_AHEAD } from '../lib/booking-rules.ts';
import { SPORT_LABELS, SPORTS, addDays, formatShortDate, todayInJakarta } from '../lib/format.ts';
import type { Sport, Venue } from '../lib/types.ts';

type SortKey = 'cocok' | 'termurah' | 'rating';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'cocok', label: 'Paling cocok' },
  { value: 'termurah', label: 'Termurah' },
  { value: 'rating', label: 'Rating tertinggi' },
];

const PRICE_OPTIONS = [
  { value: '', label: 'Semua harga' },
  { value: '100000', label: 'Maks Rp100.000' },
  { value: '150000', label: 'Maks Rp150.000' },
  { value: '200000', label: 'Maks Rp200.000' },
];

const START_HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

const SORTERS: Record<SortKey, (a: Venue, b: Venue) => number> = {
  // Paling banyak jam kosong, lalu rating, lalu harga.
  cocok: (a, b) =>
    (b.slot_kosong?.length ?? 0) - (a.slot_kosong?.length ?? 0) ||
    (b.rating_rata ?? 0) - (a.rating_rata ?? 0) ||
    a.harga_per_jam - b.harga_per_jam,
  termurah: (a, b) => a.harga_per_jam - b.harga_per_jam,
  rating: (a, b) =>
    (b.rating_rata ?? -1) - (a.rating_rata ?? -1) || b.jumlah_ulasan - a.jumlah_ulasan,
};

function isSortKey(value: string | null): value is SortKey {
  return value === 'cocok' || value === 'termurah' || value === 'rating';
}

function isSport(value: string): value is Sport {
  return (SPORTS as string[]).includes(value);
}

/** "Main di mana hari ini?" / "… besok?" / "… Sabtu ini?" / "… 12 Nov?" */
function headline(tanggal: string, today: string): string {
  if (tanggal === today) return 'Main di mana hari ini?';
  if (tanggal === addDays(today, 1)) return 'Main di mana besok?';
  const date = new Date(`${tanggal}T00:00:00`);
  if (tanggal <= addDays(today, 6)) {
    return `Main di mana ${date.toLocaleDateString('id-ID', { weekday: 'long' })} ini?`;
  }
  return `Main di mana ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}?`;
}

function SportSwitch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const options = [
    { value: '', label: 'Semua' },
    ...SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] })),
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Cabang olahraga"
      className="inline-flex shrink-0 gap-1 rounded-full bg-surface p-1"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value || 'semua'}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`h-9 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition duration-150 ease-out ${
              selected ? 'bg-raised text-fg shadow-soft' : 'text-muted hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function NameSearch({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
  const [value, setValue] = useState(initial);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(value.trim());
  };
  return (
    <form role="search" onSubmit={submit} className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => value.trim() !== initial && onSearch(value.trim())}
        placeholder="Cari nama lapangan"
        aria-label="Cari nama lapangan"
        className={`${PILL_CLASSES} w-full pl-10 font-medium`}
      />
    </form>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const today = todayInJakarta();
  const requestedDate = params.get('tanggal');
  const tanggal =
    requestedDate && requestedDate >= today && requestedDate <= addDays(today, MAX_DAYS_AHEAD)
      ? requestedDate
      : today;
  const jenisParam = params.get('jenis') ?? '';
  const jenis = isSport(jenisParam) ? jenisParam : '';
  const lokasi = params.get('lokasi') ?? '';
  const mulai = params.get('mulai') ?? '';
  const hargaMax = params.get('harga_max') ?? '';
  const q = params.get('q') ?? '';
  const urutParam = params.get('urut');
  const urut: SortKey = isSortKey(urutParam) ? urutParam : 'cocok';

  const apiQuery = new URLSearchParams(
    Object.entries({ jenis, lokasi, q, harga_max: hargaMax, tanggal, mulai }).filter(([, v]) => v),
  ).toString();
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>(`/venues?${apiQuery}`);
  const cities = useApi<{ venues: Venue[] }>('/venues');

  const cityOptions = useMemo(
    () => [...new Set((cities.data?.venues ?? []).map((venue) => venue.kota))].sort(),
    [cities.data],
  );
  const venues = useMemo(() => [...(data?.venues ?? [])].sort(SORTERS[urut]), [data, urut]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const summary = [
    `${venues.length} lapangan${jenis ? ` ${SPORT_LABELS[jenis].toLowerCase()}` : ''}`,
    formatShortDate(tanggal),
    mulai ? `mulai ${mulai}` : 'sepanjang hari',
  ].join(' · ');
  const compareQuery = new URLSearchParams(
    Object.entries({ tanggal, mulai }).filter(([, v]) => v),
  ).toString();

  return (
    <Container className="pb-28 pt-8 sm:pt-10">
      <ActiveBookingStrip />

      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="type-display text-fg">{headline(tanggal, today)}</h1>
          <p className="mt-1 text-muted" aria-live="polite">
            {data ? summary : 'Mencari lapangan…'}
          </p>
        </div>
        <div className="flex gap-2">
          <NameSearch key={q} initial={q} onSearch={(value) => update('q', value)} />
          <select
            aria-label="Urutkan"
            value={urut}
            onChange={(e) => update('urut', e.target.value === 'cocok' ? '' : e.target.value)}
            className={PILL_CLASSES}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Satu baris filter; di layar sempit bisa digeser ke samping, tidak menumpuk. */}
      <div className="-mx-5 mt-6 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 lg:justify-between">
        <SportSwitch value={jenis} onChange={(value) => update('jenis', value)} />
        <div className="flex shrink-0 gap-2">
          <select
            aria-label="Kota"
            value={lokasi}
            onChange={(e) => update('lokasi', e.target.value)}
            className={PILL_CLASSES}
          >
            <option value="">Semua kota</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Tanggal main"
            value={tanggal}
            min={today}
            max={addDays(today, MAX_DAYS_AHEAD)}
            onChange={(e) => update('tanggal', e.target.value === today ? '' : e.target.value)}
            className={PILL_CLASSES}
          />
          <select
            aria-label="Jam mulai"
            value={mulai}
            onChange={(e) => update('mulai', e.target.value)}
            className={PILL_CLASSES}
          >
            <option value="">Sepanjang hari</option>
            {START_HOURS.map((hour) => (
              <option key={hour} value={hour}>
                Mulai {hour}
              </option>
            ))}
          </select>
          <select
            aria-label="Harga maksimal"
            value={hargaMax}
            onChange={(e) => update('harga_max', e.target.value)}
            className={PILL_CLASSES}
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="mt-8" aria-label="Hasil pencarian">
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : loading && !data ? (
          <VenueGridSkeleton />
        ) : venues.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ada lapangan yang cocok"
            description="Coba kota, harga, atau tanggal lain."
            action={
              <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                Hapus semua filter
              </Button>
            }
          />
        ) : (
          <VenueGrid venues={venues} tanggal={tanggal === today ? undefined : tanggal} />
        )}
      </section>

      <CompareTray query={compareQuery} />
    </Container>
  );
}
