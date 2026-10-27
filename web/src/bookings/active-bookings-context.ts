import { createContext, useContext } from 'react';
import type { BookingSummary } from '../lib/types.ts';

export type ActiveBookingsValue = {
  /** Booking penyewa yang masih berjalan, terdekat lebih dulu. Kosong untuk peran lain. */
  active: BookingSummary[];
  reload: () => void;
};

export const ActiveBookingsContext = createContext<ActiveBookingsValue | null>(null);

export function useActiveBookings(): ActiveBookingsValue {
  const value = useContext(ActiveBookingsContext);
  if (!value) throw new Error('useActiveBookings harus dipakai di dalam <ActiveBookingsProvider>');
  return value;
}
