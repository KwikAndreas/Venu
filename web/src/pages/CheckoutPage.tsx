import {
  CircleCheck,
  Hourglass,
  Landmark,
  QrCode,
  Smartphone,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { BookingSummaryCard } from '../components/booking/BookingSummaryCard.tsx';
import { useToast } from '../components/toast/toast-context.ts';
import { Button, ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.tsx';
import { Card, Container, PageHeader } from '../components/ui/Layout.tsx';
import { useApi } from '../hooks/useApi.ts';
import { api, toApiError } from '../lib/api.ts';
import { MAX_UPLOAD_BYTES } from '../lib/booking-rules.ts';
import { PAYMENT_METHOD_LABELS } from '../lib/format.ts';
import type { BookingSummary, PaymentMethod } from '../lib/types.ts';

const ACCEPTED_PROOF_TYPES = '.jpg,.jpeg,.png,.webp,.pdf';

// Semua instruksi pembayaran di bawah adalah SIMULASI untuk keperluan tugas.
const METHODS: { value: PaymentMethod; icon: LucideIcon; instruction: string }[] = [
  {
    value: 'transfer',
    icon: Landmark,
    instruction: 'Transfer ke rekening simulasi 000-000-0000 a.n. Venu Demo.',
  },
  {
    value: 'e_wallet',
    icon: Smartphone,
    instruction: 'Kirim ke nomor e-wallet simulasi 0800-0000-0000 a.n. Venu Demo.',
  },
  {
    value: 'qris',
    icon: QrCode,
    instruction: 'Pindai kode QRIS simulasi di kasir lapangan, lalu simpan buktinya.',
  },
];

function PaymentForm({ booking, onPaid }: { booking: BookingSummary; onPaid: () => void }) {
  const { showToast } = useToast();
  const [metode, setMetode] = useState<PaymentMethod>('transfer');
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFileError(undefined);
    setFile(undefined);
    if (!selected) return;
    if (selected.size > MAX_UPLOAD_BYTES) {
      setFileError('Ukuran file maksimal 2 MB.');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setFileError('Pilih file bukti bayar terlebih dahulu.');
      return;
    }
    const form = new FormData();
    form.set('metode', metode);
    form.set('bukti', file);

    setSubmitting(true);
    try {
      await api.upload(`/bookings/${booking.id}/payment`, form);
      showToast('Bukti bayar terkirim. Menunggu verifikasi pemilik.', 'success');
      onPaid();
    } catch (caught) {
      setFileError(toApiError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h2 className="type-h2 text-navy-900">Pembayaran</h2>
          <p className="mt-1 text-sm text-muted">
            Pembayaran ini simulasi. Tidak ada uang yang ditarik.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-navy-900">Metode pembayaran</legend>
          {METHODS.map(({ value, icon: Icon, instruction }) => {
            const selected = metode === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-500 ${
                  selected ? 'border-gold-500 bg-gold-100' : 'border-line hover:border-navy-600'
                }`}
              >
                <input
                  type="radio"
                  name="metode"
                  value={value}
                  checked={selected}
                  onChange={() => setMetode(value)}
                  className="sr-only"
                />
                <Icon className="mt-0.5 size-5 shrink-0 text-navy-900" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-navy-900">
                    {PAYMENT_METHOD_LABELS[value]}
                  </span>
                  {selected && <span className="mt-1 block text-sm text-muted">{instruction}</span>}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div>
          <label htmlFor="bukti" className="mb-1.5 block text-sm font-medium text-navy-900">
            Bukti bayar
          </label>
          <input
            id="bukti"
            type="file"
            accept={ACCEPTED_PROOF_TYPES}
            onChange={handleFile}
            aria-invalid={fileError ? true : undefined}
            aria-describedby="bukti-info"
            className="block w-full cursor-pointer rounded-sm border border-line bg-surface text-sm text-muted file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-ivory file:px-4 file:text-sm file:font-medium file:text-navy-900"
          />
          <p
            id="bukti-info"
            className={`mt-1.5 text-sm ${fileError ? 'text-danger-700' : 'text-muted'}`}
            role={fileError ? 'alert' : undefined}
          >
            {fileError ?? 'JPG, PNG, WEBP, atau PDF. Maksimal 2 MB.'}
          </p>
        </div>

        <Button type="submit" loading={submitting} className="w-full">
          <Upload className="size-4" aria-hidden />
          Kirim Bukti Bayar
        </Button>
      </form>
    </Card>
  );
}

function PaymentStatusPanel({ booking }: { booking: BookingSummary }) {
  if (booking.payment_status === 'lunas') {
    return (
      <Card className="p-5">
        <EmptyState
          icon={CircleCheck}
          title="Pembayaran lunas"
          description="Booking Anda sudah dikonfirmasi pemilik. Sampai jumpa di lapangan!"
          action={
            <ButtonLink to="/riwayat" variant="outline">
              Lihat riwayat
            </ButtonLink>
          }
        />
      </Card>
    );
  }
  if (booking.payment_status === 'menunggu') {
    return (
      <Card className="p-5">
        <EmptyState
          icon={Hourglass}
          title="Menunggu verifikasi"
          description="Bukti bayar sudah terkirim. Pemilik lapangan akan memeriksa dan mengonfirmasi booking Anda."
          action={
            <ButtonLink to="/riwayat" variant="outline">
              Lihat riwayat
            </ButtonLink>
          }
        />
      </Card>
    );
  }
  return (
    <Card className="p-5">
      <EmptyState
        icon={Hourglass}
        title="Booking tidak bisa dibayar"
        description={`Booking ini berstatus "${booking.status}".`}
        action={
          <ButtonLink to="/cari" variant="outline">
            Cari lapangan lain
          </ButtonLink>
        }
      />
    </Card>
  );
}

export function CheckoutPage() {
  const { id } = useParams();
  const { data, error, reload } = useApi<{ booking: BookingSummary }>(`/bookings/${id}`);
  const booking = data?.booking;
  const canPay =
    booking?.status === 'menunggu' &&
    (booking.payment_status === null || booking.payment_status === 'gagal');

  return (
    <Container className="py-10">
      <PageHeader eyebrow="Checkout" title="Selesaikan pemesanan" />
      <div className="mt-8">
        {error ? (
          <ErrorState message={error.message} onRetry={reload} />
        ) : !booking ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <BookingSummaryCard booking={booking} />
            {canPay ? (
              <PaymentForm booking={booking} onPaid={reload} />
            ) : (
              <PaymentStatusPanel booking={booking} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
