import { RotateCcw, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState } from '../components/ui/Feedback.tsx';
import { SelectField, TextField } from '../components/ui/Field.tsx';
import { Card, Container, PageHeader } from '../components/ui/Layout.tsx';
import { VenueGrid, VenueGridSkeleton } from '../components/venue/VenueGrid.tsx';
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

function FilterPanel({
  initial,
  onApply,
  onReset,
}: {
  initial: Filters;
  onApply: (filters: Filters) => void;
  onReset: () => void;
}) {
  const [filters, setFilters] = useState(initial);
  const update = (key: FilterKey, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply(filters);
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} aria-label="Filter lapangan" className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-navy-900">Olahraga</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'Semua' },
              ...SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] })),
            ].map((option) => {
              const selected = filters.jenis === option.value;
              return (
                <label
                  key={option.value || 'semua'}
                  className={`inline-flex h-10 cursor-pointer items-center rounded-md border px-3 text-sm transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-500 ${
                    selected
                      ? 'border-navy-900 bg-navy-900 text-ivory'
                      : 'border-line bg-surface text-navy-900 hover:border-navy-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value={option.value}
                    checked={selected}
                    onChange={() => update('jenis', option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>
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
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Harga min"
            type="number"
            min={0}
            step={10000}
            inputMode="numeric"
            placeholder="Rp"
            value={filters.harga_min}
            onChange={(event) => update('harga_min', event.target.value)}
          />
          <TextField
            label="Harga maks"
            type="number"
            min={0}
            step={10000}
            inputMode="numeric"
            placeholder="Rp"
            value={filters.harga_max}
            onChange={(event) => update('harga_max', event.target.value)}
          />
        </div>
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
        <div className="flex flex-col gap-2">
          <Button type="submit">
            <Search className="size-4" aria-hidden />
            Terapkan Filter
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const filters = readFilters(params);
  const tanggal = params.get('tanggal') ?? undefined;
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>(
    `/venues?${toApiQuery(filters)}`,
  );

  const applyFilters = (next: Filters) => {
    const updated = new URLSearchParams(toApiQuery(next));
    if (tanggal) updated.set('tanggal', tanggal);
    setParams(updated);
    setShowFilters(false);
  };
  const resetFilters = () => setParams(tanggal ? { tanggal } : {});

  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Cari lapangan"
        title="Temukan lapangan"
        description="Pilih olahraga, lokasi, dan rentang harga yang sesuai."
        actions={
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters((open) => !open)}
            aria-expanded={showFilters}
            aria-controls="panel-filter"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter
          </Button>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside id="panel-filter" className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          {/* key memaksa form diisi ulang dari URL setiap kali filter di URL berubah. */}
          <FilterPanel
            key={params.toString()}
            initial={filters}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        </aside>

        <section aria-live="polite">
          {error ? (
            <ErrorState message={error.message} onRetry={reload} />
          ) : loading || !data ? (
            <VenueGridSkeleton />
          ) : data.venues.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Lapangan tidak ditemukan"
              description="Coba ubah atau hapus beberapa filter."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Reset filter
                </Button>
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">{data.venues.length} lapangan ditemukan</p>
              <VenueGrid venues={data.venues} tanggal={tanggal} />
            </>
          )}
        </section>
      </div>
    </Container>
  );
}
