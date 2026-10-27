import { nowInJakarta } from './format.ts';
import type { BookingStatus, PaymentStatus } from './types.ts';

export type StageTone = 'warning' | 'success' | 'danger' | 'neutral';

/** Satu status yang dibaca pengguna, gabungan status booking + status pembayaran. */
export type Stage = { label: string; tone: StageTone };

type BookingTime = { tanggal: string; jam_mulai: string; jam_selesai: string };

type StageInput = BookingTime & {
  status: BookingStatus;
  payment_status: PaymentStatus | null;
};

type Now = { date: string; time: string };

/** Jadwal main sudah dimulai (menurut WIB). */
export function hasStarted(booking: BookingTime, now: Now = nowInJakarta()): boolean {
  return (
    booking.tanggal < now.date || (booking.tanggal === now.date && booking.jam_mulai <= now.time)
  );
}

/** Jadwal main sudah selesai (menurut WIB). */
export function hasEnded(booking: BookingTime, now: Now = nowInJakarta()): boolean {
  return (
    booking.tanggal < now.date || (booking.tanggal === now.date && booking.jam_selesai <= now.time)
  );
}

/** Sudut pandang penyewa: apa yang sedang terjadi dengan booking saya? */
export function renterStage(booking: StageInput, now: Now = nowInJakarta()): Stage {
  switch (booking.status) {
    case 'menunggu':
      return booking.payment_status === 'menunggu'
        ? { label: 'Menunggu konfirmasi pemilik', tone: 'warning' }
        : { label: 'Menunggu pembayaran', tone: 'warning' };
    case 'dikonfirmasi':
      if (hasEnded(booking, now)) return { label: 'Selesai', tone: 'neutral' };
      if (hasStarted(booking, now)) return { label: 'Sedang berlangsung', tone: 'success' };
      return { label: 'Terkonfirmasi', tone: 'success' };
    case 'selesai':
      return { label: 'Selesai', tone: 'neutral' };
    case 'ditolak':
      return { label: 'Ditolak pemilik', tone: 'danger' };
    case 'dibatalkan':
      return { label: 'Dibatalkan', tone: 'neutral' };
  }
}

/** Sudut pandang pemilik: apa yang perlu saya lakukan dengan booking ini? */
export function ownerStage(booking: StageInput, now: Now = nowInJakarta()): Stage {
  if (booking.status === 'menunggu') {
    return booking.payment_status === 'menunggu'
      ? { label: 'Perlu dikonfirmasi', tone: 'warning' }
      : { label: 'Belum dibayar', tone: 'neutral' };
  }
  if (booking.status === 'ditolak') return { label: 'Ditolak', tone: 'danger' };
  return renterStage(booking, now);
}

/** Booking yang masih "berjalan" bagi penyewa: menunggu, atau terkonfirmasi dan belum selesai. */
export function isActiveBooking(booking: StageInput, now: Now = nowInJakarta()): boolean {
  return (
    booking.status === 'menunggu' || (booking.status === 'dikonfirmasi' && !hasEnded(booking, now))
  );
}
