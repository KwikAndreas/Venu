export const BOOKING_STATUSES = [
  'menunggu',
  'dikonfirmasi',
  'ditolak',
  'dibatalkan',
  'selesai',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && (BOOKING_STATUSES as readonly string[]).includes(value);
}

/** Status booking yang masih "memegang" slot sehingga slot itu tidak bisa dibooking orang lain. */
export const SLOT_HOLDING_STATUSES: readonly BookingStatus[] = ['menunggu', 'dikonfirmasi'];

/** Status booking yang masih boleh dibatalkan oleh penyewa. */
export const CANCELLABLE_STATUSES: readonly BookingStatus[] = ['menunggu', 'dikonfirmasi'];

export const PAYMENT_STATUSES = ['menunggu', 'lunas', 'gagal'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['transfer', 'e_wallet', 'qris'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && (PAYMENT_METHODS as readonly string[]).includes(value);
}
