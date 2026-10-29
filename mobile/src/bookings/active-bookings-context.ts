import { createContext, use } from 'react';
import type { BookingSummary } from '@/lib/types';

export type ActiveBookingsValue = {
  /** Booking penyewa yang masih berjalan, terdekat lebih dulu. */
  active: BookingSummary[];
  /** Pemilik: jumlah booking masuk yang bukti bayarnya sudah terkirim dan perlu dikonfirmasi. */
  toConfirm: number;
  reload: () => void;
};

export const ActiveBookingsContext = createContext<ActiveBookingsValue>({
  active: [],
  toConfirm: 0,
  reload: () => undefined,
});

export function useActiveBookings(): ActiveBookingsValue {
  return use(ActiveBookingsContext);
}
