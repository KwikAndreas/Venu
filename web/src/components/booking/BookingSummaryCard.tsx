import { MapPin } from 'lucide-react';
import { formatDate, formatRupiah, hoursBetween } from '../../lib/format.ts';
import type { BookingSummary } from '../../lib/types.ts';
import { BookingStatusBadge, PaymentStatusBadge, SportBadge } from '../ui/Badge.tsx';
import { Card } from '../ui/Layout.tsx';
import { DateBlock } from './DateBlock.tsx';

/** Ringkasan booking bergaya tiket: info pertandingan di atas, sobekan putus-putus, total di bawah. */
export function BookingSummaryCard({ booking }: { booking: BookingSummary }) {
  const hours = hoursBetween(booking.jam_mulai, booking.jam_selesai);
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SportBadge sport={booking.jenis_olahraga} />
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.payment_status} />
        </div>
        <h2 className="type-h2 mt-4 text-fg">{booking.venue_nama}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4" aria-hidden />
          {booking.venue_kota}
        </p>
        <div className="mt-5 flex items-center gap-4">
          <DateBlock date={booking.tanggal} />
          <div>
            <p className="type-label text-muted">{formatDate(booking.tanggal)}</p>
            <p className="type-score mt-1 text-fg">
              {booking.jam_mulai}–{booking.jam_selesai}
            </p>
            <p className="mt-1 text-sm text-muted">{hours} jam · WIB</p>
          </div>
        </div>
      </div>
      <dl className="border-t border-dashed border-line bg-surface-2/50 p-5 text-sm">
        <div className="flex justify-between text-muted">
          <dt>
            {formatRupiah(booking.harga_per_jam)} × {hours} jam
          </dt>
          <dd>{formatRupiah(booking.total_harga)}</dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <dt className="type-label text-muted">Total bayar</dt>
          <dd className="type-score text-volt">{formatRupiah(booking.total_harga)}</dd>
        </div>
      </dl>
    </Card>
  );
}
