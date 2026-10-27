import type { BookingStatus, PaymentMethod, PaymentStatus, Role, Sport } from './types.ts';

const TIME_ZONE = 'Asia/Jakarta';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount);
}

/** Harga ringkas ala papan skor: 150000 → "150K", 1250000 → "1,25JT". */
export function formatPriceShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })}JT`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}K`;
  }
  return String(amount);
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

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  menunggu: 'Menunggu',
  dikonfirmasi: 'Dikonfirmasi',
  ditolak: 'Ditolak',
  dibatalkan: 'Dibatalkan',
  selesai: 'Selesai',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  menunggu: 'Menunggu verifikasi',
  lunas: 'Lunas',
  gagal: 'Gagal',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: 'Transfer bank',
  e_wallet: 'E-wallet',
  qris: 'QRIS',
};
