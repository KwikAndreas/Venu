import { CalendarX2 } from 'lucide-react';
import { useState } from 'react';
import { useActiveBookings } from '../bookings/active-bookings-context.ts';
import { DateBlock } from '../components/booking/DateBlock.tsx';
import { useToast } from '../components/toast/toast-context.ts';
import { StatusBadge } from '../components/ui/Badge.tsx';
import { Button, ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { Card, Container, PageHeader } from '../components/ui/Layout.tsx';
import { ConfirmDialog } from '../components/ui/Modal.tsx';
import { useApi } from '../hooks/useApi.ts';
import { api, toApiError } from '../lib/api.ts';
import { hasEnded, hasStarted, isActiveBooking, renterStage } from '../lib/booking-stage.ts';
import { formatDate, formatRupiah } from '../lib/format.ts';
import type { BookingSummary } from '../lib/types.ts';

function needsPayment(booking: BookingSummary): boolean {
  return (
    booking.status === 'menunggu' &&
    (booking.payment_status === null || booking.payment_status === 'gagal')
  );
}

/** Bisa dibatalkan selama belum dimulai; backend tetap memeriksa ulang. */
function canCancel(booking: BookingSummary): boolean {
  return ['menunggu', 'dikonfirmasi'].includes(booking.status) && !hasStarted(booking);
}

/** Ulasan baru masuk akal setelah jadwal main selesai. */
function canReview(booking: BookingSummary): boolean {
  return ['dikonfirmasi', 'selesai'].includes(booking.status) && hasEnded(booking);
}

function BookingRow({ booking, onCancel }: { booking: BookingSummary; onCancel: () => void }) {
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <DateBlock date={booking.tanggal} />
        <div className="min-w-0">
          <h3 className="type-h3 truncate text-fg">
            <span className="sr-only">{formatDate(booking.tanggal)}, </span>
            {booking.venue_nama}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            <span className="font-semibold tabular-nums text-fg">
              {booking.jam_mulai}–{booking.jam_selesai}
            </span>{' '}
            · {booking.venue_kota} · {formatRupiah(booking.total_harga)}
          </p>
          <div className="mt-2.5">
            <StatusBadge stage={renterStage(booking)} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {canCancel(booking) && (
          <Button variant="danger-ghost" size="sm" onClick={onCancel}>
            Batalkan
          </Button>
        )}
        {canReview(booking) && (
          <ButtonLink to={`/lapangan/${booking.venue_id}#ulasan`} variant="secondary" size="sm">
            Beri ulasan
          </ButtonLink>
        )}
        {needsPayment(booking) && (
          <ButtonLink to={`/booking/${booking.id}/bayar`} size="sm">
            Bayar sekarang
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

function BookingSection({
  title,
  bookings,
  onCancel,
}: {
  title: string;
  bookings: BookingSummary[];
  onCancel: (booking: BookingSummary) => void;
}) {
  if (bookings.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="type-h3 mb-3 text-fg">{title}</h2>
      <ul className="space-y-3">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <BookingRow booking={booking} onCancel={() => onCancel(booking)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HistoryPage() {
  const { showToast } = useToast();
  const activeBookings = useActiveBookings();
  const { data, error, reload } = useApi<{ bookings: BookingSummary[] }>('/bookings/mine');
  const [toCancel, setToCancel] = useState<BookingSummary>();
  const [cancelling, setCancelling] = useState(false);

  const upcoming = (data?.bookings ?? [])
    .filter((booking) => isActiveBooking(booking))
    .sort((a, b) => `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`));
  const past = (data?.bookings ?? []).filter((booking) => !isActiveBooking(booking));

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${toCancel.id}/cancel`);
      showToast('Booking dibatalkan.', 'success');
      setToCancel(undefined);
      reload();
      activeBookings.reload();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container className="py-10">
      <PageHeader title="Booking saya" />
      <div className="mt-8 space-y-10">
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : !data ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        ) : data.bookings.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="Belum ada booking"
            description="Lapangan yang kamu pesan akan muncul di sini."
            action={<ButtonLink to="/">Cari lapangan</ButtonLink>}
          />
        ) : (
          <>
            <BookingSection title="Mendatang" bookings={upcoming} onCancel={setToCancel} />
            <BookingSection title="Selesai & dibatalkan" bookings={past} onCancel={setToCancel} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={toCancel !== undefined}
        title="Batalkan booking ini?"
        message={
          toCancel &&
          `${toCancel.venue_nama}, ${formatDate(toCancel.tanggal)} pukul ${toCancel.jam_mulai}. Bukti bayar yang belum diverifikasi ikut dibatalkan.`
        }
        confirmLabel="Ya, batalkan"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(undefined)}
      />
    </Container>
  );
}
