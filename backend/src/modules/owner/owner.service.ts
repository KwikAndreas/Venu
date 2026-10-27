import { withTransaction } from '../../db/transaction.ts';
import { HttpError } from '../../lib/http-error.ts';
import { daysBetweenInclusive } from '../../lib/time.ts';
import { recordAudit } from '../audit/audit.service.ts';
import { setBookingStatus, type Booking } from '../bookings/booking.repository.ts';
import {
  failPendingPayments,
  lockPendingPayment,
  setPaymentStatus,
} from '../payments/payment.repository.ts';
import {
  getVenueStats,
  listOwnerBookings,
  lockOwnerBooking,
  type OwnerBooking,
  type OwnerBookingFilter,
  type VenueStats,
} from './owner.repository.ts';

const MAX_STATS_DAYS = 366;

export type StatsPeriod = { dari: string; sampai: string };

export type OwnerStats = {
  periode: StatsPeriod & { hari: number };
  ringkasan: {
    jumlah_lapangan: number;
    jumlah_booking: number;
    booking_menunggu: number;
    booking_terkonfirmasi: number;
    pendapatan: number;
    okupansi_persen: number;
  };
  per_lapangan: (VenueStats & { okupansi_persen: number })[];
};

function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

function sum(rows: VenueStats[], key: keyof VenueStats): number {
  return rows.reduce((total, row) => total + Number(row[key]), 0);
}

export async function getOwnerStats(ownerId: number, period: StatsPeriod): Promise<OwnerStats> {
  const hari = daysBetweenInclusive(period.dari, period.sampai);
  if (hari < 1) throw new HttpError(400, '"dari" tidak boleh setelah "sampai"');
  if (hari > MAX_STATS_DAYS) throw new HttpError(400, `Periode maksimal ${MAX_STATS_DAYS} hari`);

  const venues = await getVenueStats(ownerId, { ...period, hari });
  return {
    periode: { ...period, hari },
    ringkasan: {
      jumlah_lapangan: venues.length,
      jumlah_booking: sum(venues, 'jumlah_booking'),
      booking_menunggu: sum(venues, 'booking_menunggu'),
      booking_terkonfirmasi: sum(venues, 'booking_terkonfirmasi'),
      pendapatan: sum(venues, 'pendapatan'),
      okupansi_persen: percent(sum(venues, 'jam_terpakai'), sum(venues, 'jam_tersedia')),
    },
    per_lapangan: venues.map((venue) => ({
      ...venue,
      okupansi_persen: percent(venue.jam_terpakai, venue.jam_tersedia),
    })),
  };
}

export function listIncomingBookings(
  ownerId: number,
  filter: OwnerBookingFilter,
): Promise<OwnerBooking[]> {
  return listOwnerBookings(ownerId, filter);
}

/**
 * Pemilik memverifikasi bukti bayar lalu mengonfirmasi booking. Pembayaran baru menjadi "lunas"
 * di sini, dalam transaksi yang sama dengan perubahan status booking.
 */
export async function confirmBooking(
  ownerId: number,
  bookingId: number,
  ip: string | null,
): Promise<Booking> {
  const booking = await withTransaction(async (client) => {
    const current = await lockOwnerBooking(client, bookingId, ownerId);
    if (!current) throw new HttpError(404, 'Booking tidak ditemukan');
    if (current.status !== 'menunggu') {
      throw new HttpError(409, `Booking berstatus "${current.status}" tidak bisa dikonfirmasi`);
    }
    const payment = await lockPendingPayment(client, bookingId);
    if (!payment) throw new HttpError(409, 'Penyewa belum mengirim bukti bayar');

    await setPaymentStatus(client, payment.id, 'lunas');
    const updated = await setBookingStatus(client, bookingId, 'dikonfirmasi');
    if (!updated) throw new Error(`Booking ${bookingId} hilang saat dikonfirmasi`);
    return updated;
  });

  await recordAudit({
    userId: ownerId,
    aksi: 'booking.dikonfirmasi',
    detail: { booking_id: bookingId },
    ip,
  });
  return booking;
}

export async function rejectBooking(
  ownerId: number,
  bookingId: number,
  alasan: string | undefined,
  ip: string | null,
): Promise<Booking> {
  const booking = await withTransaction(async (client) => {
    const current = await lockOwnerBooking(client, bookingId, ownerId);
    if (!current) throw new HttpError(404, 'Booking tidak ditemukan');
    if (current.status !== 'menunggu') {
      throw new HttpError(409, `Booking berstatus "${current.status}" tidak bisa ditolak`);
    }

    await failPendingPayments(client, bookingId);
    const updated = await setBookingStatus(client, bookingId, 'ditolak');
    if (!updated) throw new Error(`Booking ${bookingId} hilang saat ditolak`);
    return updated;
  });

  await recordAudit({
    userId: ownerId,
    aksi: 'booking.ditolak',
    detail: { booking_id: bookingId, alasan: alasan ?? null },
    ip,
  });
  return booking;
}
