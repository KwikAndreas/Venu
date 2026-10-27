import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button.tsx';
import { ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { TextField } from '../components/ui/Field.tsx';
import { Container, Eyebrow } from '../components/ui/Layout.tsx';
import { VenueList, VenueListSkeleton } from '../components/venue/VenueList.tsx';
import { useApi } from '../hooks/useApi.ts';
import { MAX_DAYS_AHEAD } from '../lib/booking-rules.ts';
import { SPORT_LABELS, SPORTS, addDays, formatPriceShort, todayInJakarta } from '../lib/format.ts';
import type { Venue } from '../lib/types.ts';

const FEATURED_COUNT = 6;

const STEPS = [
  { title: 'Cari', text: 'Saring berdasarkan olahraga, kota, dan harga.' },
  { title: 'Pilih jam', text: 'Lihat slot yang masih kosong secara langsung, lalu pesan.' },
  {
    title: 'Bayar & main',
    text: 'Unggah bukti bayar. Pemilik mengonfirmasi, kamu tinggal datang.',
  },
];

const SPORT_OPTIONS = [
  { value: '', label: 'Semua' },
  ...SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] })),
];

function QuickSearch() {
  const navigate = useNavigate();
  const today = todayInJakarta();
  const [jenis, setJenis] = useState('');
  const [tanggal, setTanggal] = useState(today);
  const [lokasi, setLokasi] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (jenis) params.set('jenis', jenis);
    if (lokasi.trim()) params.set('lokasi', lokasi.trim());
    if (tanggal) params.set('tanggal', tanggal);
    navigate(`/cari?${params}`);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Pencarian cepat" className="space-y-4">
      <fieldset>
        <legend className="type-label mb-2 text-muted">Olahraga</legend>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {SPORT_OPTIONS.map((option) => {
            const selected = jenis === option.value;
            return (
              <label
                key={option.value || 'semua'}
                className={`flex h-12 cursor-pointer items-center justify-center rounded-md border font-display text-lg font-bold uppercase tracking-[0.04em] transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-volt ${
                  selected
                    ? 'border-volt bg-volt/10 text-fg'
                    : 'border-line bg-surface text-muted hover:text-fg'
                }`}
              >
                <input
                  type="radio"
                  name="jenis"
                  value={option.value}
                  checked={selected}
                  onChange={() => setJenis(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <TextField
          label="Tanggal main"
          type="date"
          min={today}
          max={addDays(today, MAX_DAYS_AHEAD)}
          value={tanggal}
          onChange={(event) => setTanggal(event.target.value)}
        />
        <TextField
          label="Kota"
          placeholder="Jakarta, Bandung, …"
          value={lokasi}
          onChange={(event) => setLokasi(event.target.value)}
        />
        <Button type="submit" className="h-11 sm:px-7">
          Cari lapangan
          <ArrowRight
            className="size-5 transition-transform duration-150 group-hover/btn:translate-x-0.5"
            aria-hidden
          />
        </Button>
      </div>
    </form>
  );
}

function Scoreboard({ venues }: { venues: Venue[] | undefined }) {
  const rows = venues && [
    { label: 'Lapangan aktif', value: String(venues.length).padStart(2, '0') },
    { label: 'Kota', value: String(new Set(venues.map((v) => v.kota)).size).padStart(2, '0') },
    {
      label: 'Cabang olahraga',
      value: String(new Set(venues.map((v) => v.jenis_olahraga)).size).padStart(2, '0'),
    },
    {
      label: 'Mulai dari / jam',
      value: venues.length
        ? formatPriceShort(Math.min(...venues.map((v) => v.harga_per_jam)))
        : '—',
    },
  ];

  return (
    <aside
      aria-label="Papan skor Venu"
      className="stripes rounded-lg border border-line bg-surface p-6"
    >
      <p className="type-label flex items-center gap-2 text-muted">
        <span className="size-2 rounded-full bg-volt" aria-hidden />
        Papan skor
      </p>
      <dl className="mt-4 divide-y divide-line">
        {rows
          ? rows.map((row, index) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="type-label text-muted">{row.label}</dt>
                <dd className={`type-score ${index === 0 ? 'text-volt' : 'text-fg'}`}>
                  {row.value}
                </dd>
              </div>
            ))
          : Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="my-3 h-8" />)}
      </dl>
    </aside>
  );
}

export function HomePage() {
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>('/venues?urut=terbaru');

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        {/* Garis lapangan diagonal di latar hero. */}
        <div
          aria-hidden
          className="stripes pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        />
        <Container className="relative grid gap-10 py-12 md:py-16 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14">
          <div>
            <Eyebrow>Booking lapangan olahraga</Eyebrow>
            <h1 className="type-display mt-4 text-fg">
              Main malam ini.
              <br />
              <span className="text-volt">Pilih</span> lapanganmu.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Futsal, badminton, dan basket di Jakarta, Bandung, dan Surabaya. Cek jam kosong,
              pesan, bayar. Selesai.
            </p>
            <div className="mt-8">
              <QuickSearch />
            </div>
          </div>
          <Scoreboard venues={data?.venues} />
        </Container>
      </section>

      <Container className="py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Pilihan minggu ini</Eyebrow>
            <h2 className="type-h1 mt-2 text-fg">Lapangan pilihan</h2>
          </div>
          <Link
            to="/cari"
            className="group inline-flex h-11 items-center gap-1.5 font-display text-base font-bold uppercase tracking-[0.04em] text-fg hover:text-volt"
          >
            Lihat semua
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : loading || !data ? (
          <VenueListSkeleton count={FEATURED_COUNT} />
        ) : (
          <VenueList venues={data.venues.slice(0, FEATURED_COUNT)} />
        )}
      </Container>

      <section className="border-y border-line bg-surface">
        <Container className="py-14">
          <Eyebrow>Cara main</Eyebrow>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="bg-surface p-6">
                <p className="font-display text-6xl font-extrabold italic leading-none text-volt">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="type-h2 mt-4 text-fg">{step.title}</h3>
                <p className="mt-2 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
