import { ArrowRight, CalendarCheck, Search, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button.tsx';
import { ErrorState } from '../components/ui/Feedback.tsx';
import { SelectField, TextField } from '../components/ui/Field.tsx';
import { Container } from '../components/ui/Layout.tsx';
import { VenueGrid, VenueGridSkeleton } from '../components/venue/VenueGrid.tsx';
import { useApi } from '../hooks/useApi.ts';
import { SPORT_LABELS, SPORTS, addDays, todayInJakarta } from '../lib/format.ts';
import type { Venue } from '../lib/types.ts';

const FEATURED_COUNT = 6;
const MAX_DAYS_AHEAD = 30;

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Search, title: 'Cari lapangan', text: 'Filter berdasarkan olahraga, lokasi, dan harga.' },
  {
    icon: CalendarCheck,
    title: 'Pilih jadwal',
    text: 'Lihat slot jam yang masih tersedia secara langsung.',
  },
  {
    icon: ShieldCheck,
    title: 'Bayar & main',
    text: 'Unggah bukti bayar, pemilik mengonfirmasi booking Anda.',
  },
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
    <form
      onSubmit={handleSubmit}
      aria-label="Pencarian cepat"
      className="grid gap-4 rounded-lg bg-surface p-5 shadow-raised sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <SelectField
        label="Olahraga"
        value={jenis}
        onChange={(event) => setJenis(event.target.value)}
      >
        <option value="">Semua olahraga</option>
        {SPORTS.map((sport) => (
          <option key={sport} value={sport}>
            {SPORT_LABELS[sport]}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Tanggal main"
        type="date"
        min={today}
        max={addDays(today, MAX_DAYS_AHEAD)}
        value={tanggal}
        onChange={(event) => setTanggal(event.target.value)}
      />
      <TextField
        label="Lokasi"
        placeholder="Kota atau area"
        value={lokasi}
        onChange={(event) => setLokasi(event.target.value)}
      />
      <Button type="submit" className="w-full lg:w-auto">
        <Search className="size-4" aria-hidden />
        Cari Lapangan
      </Button>
    </form>
  );
}

export function HomePage() {
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>('/venues?urut=terbaru');

  return (
    <>
      <section className="bg-navy-900 pb-16 pt-14 md:pb-24 md:pt-20">
        <Container>
          <p className="type-caption text-gold-300">Booking lapangan olahraga</p>
          <h1 className="type-display mt-3 max-w-3xl text-ivory">
            Lapangan terbaik, siap dipesan dalam hitungan menit.
          </h1>
          <p className="mt-4 max-w-2xl text-ivory/80">
            Futsal, badminton, dan basket di Jakarta, Bandung, dan Surabaya. Cek jadwal kosong,
            pesan, dan bayar dalam satu tempat.
          </p>
          <div className="mt-10">
            <QuickSearch />
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="type-caption text-muted">Pilihan untuk Anda</p>
            <h2 className="type-h2 mt-1 text-navy-900">Lapangan unggulan</h2>
          </div>
          <Link
            to="/cari"
            className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-navy-900 underline-offset-4 hover:underline"
          >
            Lihat semua
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : loading || !data ? (
          <VenueGridSkeleton count={FEATURED_COUNT} />
        ) : (
          <VenueGrid venues={data.venues.slice(0, FEATURED_COUNT)} />
        )}
      </Container>

      <section className="border-t border-line bg-surface py-14">
        <Container>
          <h2 className="type-h2 text-navy-900">Cara kerja Venu</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-100">
                  <Icon className="size-5 text-navy-900" aria-hidden />
                </div>
                <div>
                  <p className="type-caption text-muted">Langkah {index + 1}</p>
                  <h3 className="type-h3 mt-1 text-navy-900">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
