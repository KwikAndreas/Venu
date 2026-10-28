import { useMemo, type ReactNode } from 'react';
import { useAuth } from '@/auth/auth-context';
import { useApi } from '@/hooks/use-api';
import { isActiveBooking } from '@/lib/booking-stage';
import type { BookingSummary } from '@/lib/types';
import { ActiveBookingsContext } from './active-bookings-context';

/** Satu sumber data booking aktif untuk angka di tab dan strip status di layar Cari. */
export function ActiveBookingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isRenter = user?.role === 'penyewa';
  const { data, reload } = useApi<{ bookings: BookingSummary[] }>(
    isRenter ? '/bookings/mine' : null,
    `user:${user?.id ?? ''}`,
  );

  const value = useMemo(() => {
    const active = (isRenter ? (data?.bookings ?? []) : [])
      .filter((booking) => isActiveBooking(booking))
      .sort((a, b) => `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`));
    return { active, reload };
  }, [data, isRenter, reload]);

  return <ActiveBookingsContext value={value}>{children}</ActiveBookingsContext>;
}
