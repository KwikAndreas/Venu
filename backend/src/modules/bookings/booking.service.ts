import { pool } from '../../db/pool.ts';
import { withTransaction } from '../../db/transaction.ts';
import { HttpError } from '../../lib/http-error.ts';
import { addDays, nowInJakarta, toMinutes, toTimeString } from '../../lib/time.ts';
import { CANCELLABLE_STATUSES } from '../../types/status.ts';
import { failPendingPayments } from '../payments/payment.repository.ts';
import type { NewBooking } from './booking.input.ts';
import {
  countUnpaidBookings,
  findBookableVenue,
  findBookingSummary,
  insertBooking,
  listBookingSummariesByUser,
  listHeldRanges,
  markBookingCancelled,
  type Booking,
  type BookingSummary,
} from './booking.repository.ts';
import {
  SLOT_MINUTES,
  dailySlots,
  isOnSlotGrid,
  overlaps,
  toRange,
  type TimeRange,
} from './slot.ts';

const MAX_DAYS_AHEAD = 30;
const MAX_BOOKING_HOURS = 4;
const MAX_UNPAID_BOOKINGS = 3;

export type Slot = {
  jam_mulai: string;
  jam_selesai: string;
  tersedia: boolean;
};

export type VenueSlots = {
  venue_id: number;
  tanggal: string;
  harga_per_jam: number;
  slots: Slot[];
};

function assertBookableDate(tanggal: string, today: string): void {
  if (tanggal < today) throw new HttpError(400, 'Tanggal sudah lewat');
  if (tanggal > addDays(today, MAX_DAYS_AHEAD)) {
    throw new HttpError(400, `Booking maksimal ${MAX_DAYS_AHEAD} hari ke depan`);
  }
}

function hasStarted(tanggal: string, startMinutes: number): boolean {
  const now = nowInJakarta();
  return tanggal < now.date || (tanggal === now.date && startMinutes <= now.minutes);
}

export async function getVenueSlots(venueId: number, tanggal: string): Promise<VenueSlots> {
  assertBookableDate(tanggal, nowInJakarta().date);
  const venue = await findBookableVenue(pool, venueId);
  if (!venue) throw new HttpError(404, 'Lapangan tidak ditemukan');

  const held = (await listHeldRanges(pool, venueId, tanggal)).map((row) =>
    toRange(row.jam_mulai, row.jam_selesai),
  );
  const slots = dailySlots(venue.jam_buka, venue.jam_tutup).map((range) => ({
    jam_mulai: toTimeString(range.start),
    jam_selesai: toTimeString(range.end),
    tersedia: !hasStarted(tanggal, range.start) && !held.some((h) => overlaps(h, range)),
  }));

  return { venue_id: venue.id, tanggal, harga_per_jam: venue.harga_per_jam, slots };
}

export function createBooking(userId: number, input: NewBooking): Promise<Booking> {
  assertBookableDate(input.tanggal, nowInJakarta().date);
  const range: TimeRange = toRange(input.jam_mulai, input.jam_selesai);

  // Cek bentrok dan insert dalam satu transaksi dengan baris lapangan terkunci, sehingga
  // dua permintaan bersamaan untuk slot yang sama tidak bisa sama-sama lolos.
  return withTransaction(async (client) => {
    const venue = await findBookableVenue(client, input.venue_id, { lock: true });
    if (!venue) throw new HttpError(404, 'Lapangan tidak ditemukan');

    if (!isOnSlotGrid(venue.jam_buka, venue.jam_tutup, range)) {
      throw new HttpError(
        400,
        `Pilih slot per jam di antara jam ${venue.jam_buka} dan ${venue.jam_tutup}`,
      );
    }
    const hours = (range.end - range.start) / SLOT_MINUTES;
    if (hours > MAX_BOOKING_HOURS) {
      throw new HttpError(400, `Maksimal ${MAX_BOOKING_HOURS} jam per booking`);
    }
    if (hasStarted(input.tanggal, range.start)) throw new HttpError(400, 'Slot sudah lewat');

    if ((await countUnpaidBookings(client, userId)) >= MAX_UNPAID_BOOKINGS) {
      throw new HttpError(429, 'Selesaikan pembayaran booking sebelumnya terlebih dahulu');
    }

    const held = await listHeldRanges(client, venue.id, input.tanggal);
    if (held.some((row) => overlaps(toRange(row.jam_mulai, row.jam_selesai), range))) {
      throw new HttpError(409, 'Slot sudah dibooking orang lain');
    }

    return insertBooking(client, {
      userId,
      venueId: venue.id,
      tanggal: input.tanggal,
      jamMulai: input.jam_mulai,
      jamSelesai: input.jam_selesai,
      totalHarga: venue.harga_per_jam * hours,
    });
  });
}

/** Booking milik user; booking milik orang lain dijawab 404 agar keberadaannya tidak bocor. */
export async function getOwnBooking(userId: number, bookingId: number): Promise<BookingSummary> {
  const booking = await findBookingSummary(bookingId);
  if (!booking || booking.user_id !== userId) throw new HttpError(404, 'Booking tidak ditemukan');
  return booking;
}

export function listOwnBookings(userId: number): Promise<BookingSummary[]> {
  return listBookingSummariesByUser(userId);
}

export async function cancelOwnBooking(userId: number, bookingId: number): Promise<Booking> {
  const booking = await getOwnBooking(userId, bookingId);
  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    throw new HttpError(409, `Booking berstatus "${booking.status}" tidak bisa dibatalkan`);
  }
  if (hasStarted(booking.tanggal, toMinutes(booking.jam_mulai))) {
    throw new HttpError(409, 'Booking yang sudah dimulai tidak bisa dibatalkan');
  }

  return withTransaction(async (client) => {
    const cancelled = await markBookingCancelled(client, bookingId, userId);
    if (!cancelled) throw new HttpError(409, 'Status booking sudah berubah, muat ulang data');
    await failPendingPayments(client, bookingId);
    return cancelled;
  });
}
