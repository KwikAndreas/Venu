import { createContext, use } from 'react';
import type { BookingSummary } from '@/lib/types';

export type ActiveBookingsValue = {
  /** Booking penyewa yang masih berjalan, terdekat lebih dulu. */
  active: BookingSummary[];
  reload: () => void;
};

export const ActiveBookingsContext = createContext<ActiveBookingsValue>({
  active: [],
  reload: () => undefined,
});

export function useActiveBookings(): ActiveBookingsValue {
  return use(ActiveBookingsContext);
}
