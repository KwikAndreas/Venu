// Bagian dari web/src/lib/format.ts yang dipakai mobile. Jaga isinya tetap sama.
import type { PaymentMethod, Role, Sport } from './types';

const TIME_ZONE = 'Asia/Jakarta';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount);
}

/** "2026-11-05" → "Kam, 5 Nov 2026" */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "2026-10-31" → "Sab, 31 Okt" (tanpa tahun, untuk teks ringkas). */
export function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** 4.8 → "4,8" */
export function formatRating(rating: number): string {
  return rating.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Tanggal (YYYY-MM-DD) dan jam (JJ:MM) saat ini menurut WIB. */
export function nowInJakarta(): { date: string; time: string } {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
  return { date: todayInJakarta(), time };
}

/** Tanggal hari ini (YYYY-MM-DD) menurut WIB, sama dengan acuan backend. */
export function todayInJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function hoursBetween(jamMulai: string, jamSelesai: string): number {
  const toMinutes = (time: string) => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  return (toMinutes(jamSelesai) - toMinutes(jamMulai)) / 60;
}

export const SPORT_LABELS: Record<Sport, string> = {
  futsal: 'Futsal',
  badminton: 'Badminton',
  basket: 'Basket',
};

export const SPORTS = Object.keys(SPORT_LABELS) as Sport[];

export const ROLE_LABELS: Record<Role, string> = {
  penyewa: 'Penyewa',
  pemilik: 'Pemilik',
  admin: 'Admin',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: 'Transfer bank',
  e_wallet: 'E-wallet',
  qris: 'QRIS',
};
