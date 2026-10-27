import { RotateCcw, SearchX, SlidersHorizontal } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState } from '../components/ui/Feedback.tsx';
import { SelectField, TextField } from '../components/ui/Field.tsx';
import { Container, PageHeader } from '../components/ui/Layout.tsx';
import { VenueList, VenueListSkeleton } from '../components/venue/VenueList.tsx';
import { useApi } from '../hooks/useApi.ts';
import { SPORT_LABELS, SPORTS } from '../lib/format.ts';
import type { Venue } from '../lib/types.ts';

// Parameter filter yang diteruskan ke GET /venues. `tanggal` hanya dibawa ke halaman detail.
const FILTER_KEYS = ['jenis', 'q', 'lokasi', 'harga_min', 'harga_max', 'urut'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
type Filters = Record<FilterKey, string>;

const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'harga_terendah', label: 'Harga terendah' },
  { value: 'harga_tertinggi', label: 'Harga tertinggi' },
  { value: 'nama', label: 'Nama (A–Z)' },
];

const SPORT_TABS = [
  { value: '', label: 'Semua' },
  ...SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] })),
];

function readFilters(params: URLSearchParams): Filters {
  return Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? ''])) as Filters;
}

function toApiQuery(filters: Filters): string {
  const query = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    if (filters[key]) query.set(key, filters[key]);
  }
  return query.toString();
}

/** Strip filter horizontal: tab olahraga di atas, kolom pencarian di bawahnya. */
function FilterStrip({
  initial,
  onApply,
  onReset,
}: {
  initial: Filters;
  onApply: (filters: Filters) => void;
  onReset: () => void;
}) {
  const [filters, setFilters] = useState(initial);
  const [showMore, setShowMore] = useState(Boolean(initial.harga_min || initial.harga_max));
  const update = (key: FilterKey, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  // Tab olahraga langsung menerapkan filter, seperti berpindah kategori.
  const chooseSport = (jenis: string) => {
    const next = { ...filters, jenis };
    setFilters(next);
    onApply(next);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Filter lapangan" className="space-y-4">
      <div
        role="radiogroup"
        aria-label="Olahraga"
        className="flex gap-6 overflow-x-auto border-b border-line"
      >
        {SPORT_TABS.map((tab) => {
          const selected = filters.jenis === tab.value;
          return (
            <button
              key={tab.value || 'semua'}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseSport(tab.value)}
              className={`-mb-px h-12 whitespace-nowrap border-b-[3px] font-display text-lg font-bold uppercase tracking-[0.04em] transition-colors duration-150 ease-out ${
                selected ? 'border-volt text-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_200px_auto] lg:items-end">
        <TextField
          label="Nama lapangan"
          placeholder="Contoh: Arena"
          value={filters.q}
          onChange={(event) => update('q', event.target.value)}
        />
        <TextField
          label="Lokasi"
          placeholder="Kota atau alamat"
          value={filters.lokasi}
          onChange={(event) => update('lokasi', event.target.value)}
        />
        <SelectField
          label="Urutkan"
          value={filters.urut || 'terbaru'}
          onChange={(event) => update('urut', event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">
            Terapkan
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-11"
            onClick={() => setShowMore((open) => !open)}
            aria-expanded={showMore}
            aria-controls="filter-harga"
            aria-label="Filter harga"
            title="Filter harga"
          >
            <SlidersHorizontal className="size-5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={onReset}
            aria-label="Reset filter"
            title="Reset filter"
          >
            <RotateCcw className="size-5" aria-hidden />
          </Button>
        </div>
      </div>

      {showMore && (
        <div id="filter-harga" className="grid max-w-md grid-cols-2 gap-3">
          <TextField
            label="Harga min (Rp)"
            type="number"
            min={0}
            step={10000}
            inputMode="numeric"
            value={filters.harga_min}
            onChange={(event) => update('harga_min', event.target.value)}
          />
          <TextField
            label="Harga maks (Rp)"
            type="number"
            min={0}
            step={10000}
            inputMode="numeric"
            value={filters.harga_max}
            onChange={(event) => update('harga_max', event.target.value)}
          />
        </div>
      )}
    </form>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const tanggal = params.get('tanggal') ?? undefined;
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>(
    `/venues?${toApiQuery(filters)}`,
  );

  const applyFilters = (next: Filters) => {
    const updated = new URLSearchParams(toApiQuery(next));
    if (tanggal) updated.set('tanggal', tanggal);
    setParams(updated);
  };
  const resetFilters = () => setParams(tanggal ? { tanggal } : {});

  return (
    <Container className="space-y-8 py-10">
      <PageHeader
        eyebrow="Cari lapangan"
        title="Semua lapangan"
        description="Pilih cabang olahraga, lalu persempit dengan lokasi atau harga."
      />

      {/* key memaksa form diisi ulang dari URL setiap kali filter di URL berubah. */}
      <FilterStrip
        key={params.toString()}
        initial={filters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <section aria-live="polite">
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : loading || !data ? (
          <VenueListSkeleton />
        ) : data.venues.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Tidak ada lapangan"
            description="Coba ubah atau hapus beberapa filter."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                Reset filter
              </Button>
            }
          />
        ) : (
          <>
            <p className="type-label mb-3 text-muted">
              <span className="text-fg">{String(data.venues.length).padStart(2, '0')}</span>{' '}
              lapangan ditemukan
            </p>
            <VenueList venues={data.venues} tanggal={tanggal} />
          </>
        )}
      </section>
    </Container>
  );
}
