import { useMemo, type ReactNode } from 'react';
import { useAuth } from '../auth/auth-context.ts';
import { useApi } from '../hooks/useApi.ts';
import { isActiveBooking } from '../lib/booking-stage.ts';
import type { BookingSummary } from '../lib/types.ts';
import { ActiveBookingsContext } from './active-bookings-context.ts';

/** Satu sumber data booking aktif untuk navbar (angka) dan strip status di halaman. */
export function ActiveBookingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data, reload } = useApi<{ bookings: BookingSummary[] }>(
    user?.role === 'penyewa' ? '/bookings/mine' : null,
    `user:${user?.id ?? ''}`,
  );

  const value = useMemo(() => {
    const active = (user?.role === 'penyewa' ? (data?.bookings ?? []) : [])
      .filter((booking) => isActiveBooking(booking))
      .sort((a, b) => `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`));
    return { active, reload };
  }, [data, reload, user]);

  return <ActiveBookingsContext value={value}>{children}</ActiveBookingsContext>;
}
