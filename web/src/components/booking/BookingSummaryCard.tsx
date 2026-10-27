import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { formatDate, formatRupiah, hoursBetween } from '../../lib/format.ts';
import type { BookingSummary } from '../../lib/types.ts';
import { BookingStatusBadge, PaymentStatusBadge, SportBadge } from '../ui/Badge.tsx';
import { Card } from '../ui/Layout.tsx';

export function BookingSummaryCard({ booking }: { booking: BookingSummary }) {
  const hours = hoursBetween(booking.jam_mulai, booking.jam_selesai);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <SportBadge sport={booking.jenis_olahraga} />
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.payment_status} />
      </div>
      <h2 className="type-h2 mt-3 text-navy-900">{booking.venue_nama}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        <li className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden />
          {booking.venue_kota}
        </li>
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden />
          {formatDate(booking.tanggal)}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4" aria-hidden />
          {booking.jam_mulai}–{booking.jam_selesai} WIB ({hours} jam)
        </li>
      </ul>
      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">
            {formatRupiah(booking.harga_per_jam)} × {hours} jam
          </dt>
          <dd>{formatRupiah(booking.total_harga)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3">
          <dt className="font-medium text-navy-900">Total bayar</dt>
          <dd className="text-lg font-bold text-navy-900">{formatRupiah(booking.total_harga)}</dd>
        </div>
      </dl>
    </Card>
  );
}
