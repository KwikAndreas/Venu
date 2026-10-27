import { Inbox, Star, Wallet, CircleX } from 'lucide-react';
import { useState } from 'react';
import { DateBlock } from '../components/booking/DateBlock.tsx';
import { useToast } from '../components/toast/toast-context.ts';
import { BookingStatusBadge, PaymentStatusBadge, SportBadge } from '../components/ui/Badge.tsx';
import { Button, ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { Card, Container, PageHeader } from '../components/ui/Layout.tsx';
import { ConfirmDialog } from '../components/ui/Modal.tsx';
import { useApi } from '../hooks/useApi.ts';
import { api, toApiError } from '../lib/api.ts';
import { formatDate, formatRupiah, todayInJakarta } from '../lib/format.ts';
import type { BookingSummary } from '../lib/types.ts';

function needsPayment(booking: BookingSummary): boolean {
  return (
    booking.status === 'menunggu' &&
    (booking.payment_status === null || booking.payment_status === 'gagal')
  );
}

/** Perkiraan di sisi tampilan; backend tetap menolak bila booking sudah dimulai. */
function canCancel(booking: BookingSummary, today: string): boolean {
  return ['menunggu', 'dikonfirmasi'].includes(booking.status) && booking.tanggal >= today;
}

function canReview(booking: BookingSummary, today: string): boolean {
  return ['dikonfirmasi', 'selesai'].includes(booking.status) && booking.tanggal <= today;
}

function BookingRow({ booking, onCancel }: { booking: BookingSummary; onCancel: () => void }) {
  const today = todayInJakarta();
  return (
    <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <div className="flex gap-4">
        <DateBlock date={booking.tanggal} />
        <div className="min-w-0 space-y-2">
          <h2 className="type-h3 text-fg">
            <span className="sr-only">{formatDate(booking.tanggal)}, </span>
            {booking.venue_nama}
          </h2>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-2xl font-bold tabular-nums text-fg">
              {booking.jam_mulai}–{booking.jam_selesai}
            </span>
            <span className="text-sm text-muted">{formatRupiah(booking.total_harga)}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SportBadge sport={booking.jenis_olahraga} />
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {needsPayment(booking) && (
          <ButtonLink to={`/booking/${booking.id}/bayar`} variant="secondary" size="sm">
            <Wallet className="size-4" aria-hidden />
            Bayar
          </ButtonLink>
        )}
        {canReview(booking, today) && (
          <ButtonLink to={`/lapangan/${booking.venue_id}#ulasan`} variant="secondary" size="sm">
            <Star className="size-4" aria-hidden />
            Beri ulasan
          </ButtonLink>
        )}
        {canCancel(booking, today) && (
          <Button variant="danger-outline" size="sm" onClick={onCancel}>
            <CircleX className="size-4" aria-hidden />
            Batalkan
          </Button>
        )}
      </div>
    </Card>
  );
}

export function HistoryPage() {
  const { showToast } = useToast();
  const { data, error, reload } = useApi<{ bookings: BookingSummary[] }>('/bookings/mine');
  const [toCancel, setToCancel] = useState<BookingSummary>();
  const [cancelling, setCancelling] = useState(false);

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${toCancel.id}/cancel`);
      showToast('Booking dibatalkan.', 'success');
      setToCancel(undefined);
      reload();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Akun saya"
        title="Riwayat booking"
        description="Semua pemesanan Anda beserta status pembayarannya."
      />
      <div className="mt-8">
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : !data ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : data.bookings.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada booking"
            description="Cari lapangan favorit Anda dan pesan jadwal pertama."
            action={<ButtonLink to="/cari">Cari Lapangan</ButtonLink>}
          />
        ) : (
          <ul className="space-y-3">
            {data.bookings.map((booking) => (
              <li key={booking.id}>
                <BookingRow booking={booking} onCancel={() => setToCancel(booking)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={toCancel !== undefined}
        title="Batalkan booking?"
        message={
          toCancel &&
          `Booking ${toCancel.venue_nama} pada ${formatDate(toCancel.tanggal)} pukul ${toCancel.jam_mulai} akan dibatalkan. Pembayaran yang belum diverifikasi akan dianggap gagal.`
        }
        confirmLabel="Ya, batalkan"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(undefined)}
      />
    </Container>
  );
}
