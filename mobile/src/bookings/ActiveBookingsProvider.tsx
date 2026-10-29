import { useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/auth/auth-context';
import { useApi } from '@/hooks/use-api';
import { isActiveBooking } from '@/lib/booking-stage';
import type { BookingSummary, OwnerBooking } from '@/lib/types';
import { ActiveBookingsContext } from './active-bookings-context';

/**
 * Satu sumber data untuk angka di tab booking dan strip status di layar Cari.
 * Penyewa: booking yang masih berjalan. Pemilik: booking masuk yang menunggu konfirmasinya.
 */
export function ActiveBookingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const scope = `user:${user?.id ?? ''}`;
  const isRenter = user?.role === 'penyewa';
  const isOwner = user?.role === 'pemilik';
  const renter = useApi<{ bookings: BookingSummary[] }>(isRenter ? '/bookings/mine' : null, scope);
  const owner = useApi<{ bookings: OwnerBooking[] }>(
    isOwner ? '/owner/bookings?status=menunggu' : null,
    scope,
  );
  const reloadRenter = renter.reload;
  const reloadOwner = owner.reload;

  const reload = useCallback(() => {
    reloadRenter();
    reloadOwner();
  }, [reloadRenter, reloadOwner]);

  const value = useMemo(() => {
    const active = (isRenter ? (renter.data?.bookings ?? []) : [])
      .filter((booking) => isActiveBooking(booking))
      .sort((a, b) => `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`));
    const toConfirm = (isOwner ? (owner.data?.bookings ?? []) : []).filter(
      (booking) => booking.payment_status === 'menunggu',
    ).length;
    return { active, toConfirm, reload };
  }, [renter.data, owner.data, isRenter, isOwner, reload]);

  return <ActiveBookingsContext value={value}>{children}</ActiveBookingsContext>;
}
