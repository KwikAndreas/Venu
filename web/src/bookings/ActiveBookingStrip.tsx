import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { StatusBadge } from '../components/ui/Badge.tsx';
import { renterStage } from '../lib/booking-stage.ts';
import { formatShortDate } from '../lib/format.ts';
import { useActiveBookings } from './active-bookings-context.ts';

/**
 * Status booking terdekat, tampil di atas judul halaman tanpa perlu scroll.
 * Status yang ditampilkan selalu milik booking yang disebut namanya; booking lain cukup dihitung.
 * Tidak dirender sama sekali bila tidak ada booking aktif.
 */
export function ActiveBookingStrip() {
  const { active } = useActiveBookings();
  const nearest = active[0];
  if (!nearest) return null;

  const stage = renterStage(nearest);
  const others = active.length - 1;
  const needsPayment = nearest.status === 'menunggu' && nearest.payment_status !== 'menunggu';
  const href = others === 0 && needsPayment ? `/booking/${nearest.id}/bayar` : '/riwayat';
  const action = others > 0 ? 'Lihat semua' : needsPayment ? 'Bayar sekarang' : 'Lihat detail';

  return (
    <Link
      to={href}
      className="group flex w-fit max-w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl border border-line bg-surface py-2 pl-2 pr-5 transition-colors hover:border-muted sm:rounded-full"
    >
      <StatusBadge stage={stage} />
      <span className="text-sm text-muted">
        <span className="font-semibold text-fg">{nearest.venue_nama}</span> ·{' '}
        {formatShortDate(nearest.tanggal)} · {nearest.jam_mulai}–{nearest.jam_selesai}
        {others > 0 && <span className="font-semibold text-fg"> · +{others} booking lain</span>}
      </span>
      <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
        {action}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
