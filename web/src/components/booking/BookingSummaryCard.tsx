import { renterStage } from '../../lib/booking-stage.ts';
import { formatDate, formatRupiah, hoursBetween } from '../../lib/format.ts';
import type { BookingSummary } from '../../lib/types.ts';
import { StatusBadge } from '../ui/Badge.tsx';
import { Card } from '../ui/Layout.tsx';
import { DateBlock } from './DateBlock.tsx';

/** Ringkasan booking: lapangan & jadwal di atas, rincian harga di bawah garis putus-putus. */
export function BookingSummaryCard({ booking }: { booking: BookingSummary }) {
  const hours = hoursBetween(booking.jam_mulai, booking.jam_selesai);
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <StatusBadge stage={renterStage(booking)} />
        <h2 className="type-h2 mt-4 text-fg">{booking.venue_nama}</h2>
        <p className="text-sm text-muted">{booking.venue_kota}</p>
        <div className="mt-5 flex items-center gap-4">
          <DateBlock date={booking.tanggal} />
          <div>
            <p className="text-sm text-muted">{formatDate(booking.tanggal)}</p>
            <p className="text-xl font-bold tabular-nums tracking-tight text-fg">
              {booking.jam_mulai}–{booking.jam_selesai}
            </p>
            <p className="text-sm text-muted">{hours} jam</p>
          </div>
        </div>
      </div>
      <dl className="space-y-2 border-t border-dashed border-line bg-surface/60 p-6 text-sm">
        <div className="flex justify-between text-muted">
          <dt>
            {formatRupiah(booking.harga_per_jam)} × {hours} jam
          </dt>
          <dd>{formatRupiah(booking.total_harga)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-semibold text-fg">Total bayar</dt>
          <dd className="text-xl font-bold tracking-tight text-fg">
            {formatRupiah(booking.total_harga)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
