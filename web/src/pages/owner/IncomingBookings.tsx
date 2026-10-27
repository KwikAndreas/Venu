import { Check, Eye, Inbox, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../components/toast/toast-context.ts';
import { StatusBadge } from '../../components/ui/Badge.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { TextAreaField } from '../../components/ui/Field.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { IconAction, Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { ownerStage } from '../../lib/booking-stage.ts';
import { formatDate, formatRupiah } from '../../lib/format.ts';
import type { BookingStatus, OwnerBooking } from '../../lib/types.ts';
import { ProofModal } from './ProofModal.tsx';

type StatusFilter = BookingStatus | 'semua';
const STATUS_FILTERS: StatusFilter[] = [
  'menunggu',
  'dikonfirmasi',
  'ditolak',
  'dibatalkan',
  'semua',
];

const FILTER_LABELS: Record<StatusFilter, string> = {
  menunggu: 'Perlu diproses',
  dikonfirmasi: 'Terkonfirmasi',
  ditolak: 'Ditolak',
  dibatalkan: 'Dibatalkan',
  selesai: 'Selesai',
  semua: 'Semua',
};

type PendingAction = { kind: 'confirm' | 'reject'; booking: OwnerBooking };

export function IncomingBookings() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<StatusFilter>('menunggu');
  const query = status === 'semua' ? '' : `?status=${status}`;
  const { data, error, reload } = useApi<{ bookings: OwnerBooking[] }>(`/owner/bookings${query}`);
  const [action, setAction] = useState<PendingAction>();
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [proofPaymentId, setProofPaymentId] = useState<number>();

  const closeAction = () => {
    setAction(undefined);
    setAlasan('');
  };

  const runAction = async () => {
    if (!action) return;
    setProcessing(true);
    try {
      if (action.kind === 'confirm') {
        await api.post(`/owner/bookings/${action.booking.id}/confirm`);
        showToast('Booking dikonfirmasi dan pembayaran ditandai lunas.', 'success');
      } else {
        await api.post(`/owner/bookings/${action.booking.id}/reject`, {
          alasan: alasan.trim() || undefined,
        });
        showToast('Booking ditolak.', 'success');
      }
      closeAction();
      reload();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        role="radiogroup"
        aria-label="Tampilkan booking"
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1"
      >
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={status === option}
            onClick={() => setStatus(option)}
            className={`h-9 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition duration-150 ease-out ${
              status === option ? 'bg-raised text-fg shadow-soft' : 'text-muted hover:text-fg'
            }`}
          >
            {FILTER_LABELS[option]}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : data.bookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Tidak ada booking"
          description="Belum ada booking dengan status ini."
        />
      ) : (
        <Table label="Booking masuk">
          <thead>
            <tr>
              <Th>Jadwal</Th>
              <Th>Lapangan</Th>
              <Th>Penyewa</Th>
              <Th className="text-right">Total</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.bookings.map((booking) => (
              <Tr key={booking.id}>
                <Td>
                  <div className="font-medium">{formatDate(booking.tanggal)}</div>
                  <div className="text-muted">
                    {booking.jam_mulai}–{booking.jam_selesai}
                  </div>
                </Td>
                <Td>{booking.venue_nama}</Td>
                <Td>
                  <div className="font-medium">{booking.penyewa_nama}</div>
                  <div className="text-muted">{booking.penyewa_email}</div>
                </Td>
                <Td className="text-right font-semibold">{formatRupiah(booking.total_harga)}</Td>
                <Td>
                  <StatusBadge stage={ownerStage(booking)} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    {booking.ada_bukti && booking.payment_id !== null && (
                      <IconAction
                        icon={Eye}
                        label="Lihat bukti bayar"
                        onClick={() => setProofPaymentId(booking.payment_id ?? undefined)}
                      />
                    )}
                    {booking.status === 'menunggu' && (
                      <>
                        <IconAction
                          icon={Check}
                          label="Konfirmasi booking"
                          disabled={booking.payment_status !== 'menunggu'}
                          onClick={() => setAction({ kind: 'confirm', booking })}
                        />
                        <IconAction
                          icon={X}
                          label="Tolak booking"
                          tone="danger"
                          onClick={() => setAction({ kind: 'reject', booking })}
                        />
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={action?.kind === 'confirm'}
        title="Konfirmasi booking?"
        message={
          action &&
          `Pastikan bukti bayar ${action.booking.penyewa_nama} sudah sesuai. Pembayaran sebesar ${formatRupiah(action.booking.total_harga)} akan ditandai lunas.`
        }
        confirmLabel="Konfirmasi"
        destructive={false}
        loading={processing}
        onConfirm={runAction}
        onCancel={closeAction}
      />
      <ConfirmDialog
        open={action?.kind === 'reject'}
        title="Tolak booking?"
        message={
          action &&
          `Booking ${action.booking.penyewa_nama} pada ${formatDate(action.booking.tanggal)} akan ditolak.`
        }
        confirmLabel="Tolak booking"
        loading={processing}
        onConfirm={runAction}
        onCancel={closeAction}
      >
        <TextAreaField
          label="Alasan (opsional)"
          value={alasan}
          onChange={(event) => setAlasan(event.target.value)}
        />
      </ConfirmDialog>
      <ProofModal paymentId={proofPaymentId} onClose={() => setProofPaymentId(undefined)} />
    </div>
  );
}
