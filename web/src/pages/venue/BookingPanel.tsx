import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../auth/auth-context.ts';
import { useToast } from '../../components/toast/toast-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/Field.tsx';
import { Card } from '../../components/ui/Layout.tsx';
import { SlotPicker } from '../../components/venue/SlotPicker.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { MAX_BOOKING_HOURS, MAX_DAYS_AHEAD } from '../../lib/booking-rules.ts';
import { addDays, formatDate, formatRupiah, todayInJakarta } from '../../lib/format.ts';
import type { Booking, Slot, VenueDetail, VenueSlots } from '../../lib/types.ts';

/**
 * Pilihan slot selalu berurutan: klik slot di samping pilihan memperpanjang, klik ujung
 * memendekkan, klik slot lain memulai pilihan baru.
 */
function nextSelection(current: number[], index: number): number[] {
  const first = current[0];
  const last = current.at(-1);
  if (first === undefined || last === undefined) return [index];
  if (index === first && index === last) return [];
  if (index === first) return current.slice(1);
  if (index === last) return current.slice(0, -1);
  if (index === first - 1) return [index, ...current];
  if (index === last + 1) return [...current, index];
  return [index];
}

type BookingPanelProps = {
  venue: VenueDetail;
  tanggal: string;
  onTanggalChange: (tanggal: string) => void;
};

export function BookingPanel({ venue, tanggal, onTanggalChange }: BookingPanelProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const today = todayInJakarta();
  const slotsState = useApi<VenueSlots>(`/venues/${venue.id}/slots?tanggal=${tanggal}`);
  const [selection, setSelection] = useState<{ tanggal: string; indexes: number[] }>({
    tanggal,
    indexes: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Pilihan otomatis kosong saat tanggal berganti.
  const indexes = selection.tanggal === tanggal ? selection.indexes : [];
  const slots = slotsState.data?.slots ?? [];
  const firstSlot = indexes[0] === undefined ? undefined : slots[indexes[0]];
  const lastSlot = indexes.at(-1) === undefined ? undefined : slots[indexes.at(-1) as number];
  const hours = indexes.length;
  const isRenter = user?.role === 'penyewa';

  const toggleSlot = (slot: Slot) => {
    const next = nextSelection(indexes, slots.indexOf(slot));
    if (next.length > MAX_BOOKING_HOURS) {
      showToast(`Maksimal ${MAX_BOOKING_HOURS} jam per booking`, 'info');
      return;
    }
    setSelection({ tanggal, indexes: next });
  };

  const handleBook = async () => {
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    if (!firstSlot || !lastSlot) return;

    setSubmitting(true);
    try {
      const { booking } = await api.post<{ booking: Booking }>('/bookings', {
        venue_id: venue.id,
        tanggal,
        jam_mulai: firstSlot.jam_mulai,
        jam_selesai: lastSlot.jam_selesai,
      });
      navigate(`/booking/${booking.id}/bayar`);
    } catch (caught) {
      const error = toApiError(caught);
      showToast(error.message, 'error');
      if (error.status === 409) {
        setSelection({ tanggal, indexes: [] });
        slotsState.reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 lg:sticky lg:top-24">
      <h2 className="type-h2 text-fg">Pilih jadwal</h2>
      <p className="mt-1 text-sm text-muted">
        Slot per jam, maksimal {MAX_BOOKING_HOURS} jam per booking.
      </p>

      <TextField
        className="mt-5"
        label="Tanggal main"
        type="date"
        min={today}
        max={addDays(today, MAX_DAYS_AHEAD)}
        value={tanggal}
        onChange={(event) => event.target.value && onTanggalChange(event.target.value)}
      />

      <div className="mt-5">
        <p className="type-label mb-2 text-muted">Jam mulai</p>
        {slotsState.error ? (
          <ErrorState message={slotsState.error.message} onRetry={slotsState.reload} />
        ) : !slotsState.data ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        ) : (
          <SlotPicker
            slots={slots}
            selected={indexes.flatMap((index) => slots[index]?.jam_mulai ?? [])}
            onToggle={toggleSlot}
          />
        )}
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>Gelap: tersedia</span>
          <span className="text-volt">Volt: dipilih</span>
          <span className="line-through">Bergaris: tidak tersedia</span>
        </p>
      </div>

      <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Tanggal</dt>
          <dd className="text-right font-medium">
            <CalendarDays className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
            {formatDate(tanggal)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Jam</dt>
          <dd className="font-medium">
            {firstSlot && lastSlot
              ? `${firstSlot.jam_mulai}–${lastSlot.jam_selesai} (${hours} jam)`
              : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Harga per jam</dt>
          <dd className="font-medium">{formatRupiah(venue.harga_per_jam)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <dt className="font-medium text-fg">Total</dt>
          <dd className="type-score text-fg">{formatRupiah(hours * venue.harga_per_jam)}</dd>
        </div>
      </dl>

      <Button
        className="mt-5 w-full"
        onClick={handleBook}
        loading={submitting}
        disabled={hours === 0 || (user !== null && !isRenter)}
      >
        Pesan Sekarang
      </Button>
      {user && !isRenter && (
        <p className="mt-2 text-center text-xs text-muted">Pemesanan hanya untuk akun penyewa.</p>
      )}
      {!user && (
        <p className="mt-2 text-center text-xs text-muted">
          Anda akan diminta masuk sebelum memesan.
        </p>
      )}
    </Card>
  );
}
