import { pool } from '../../db/pool.ts';
import type { Db } from '../../db/transaction.ts';
import type { Sport } from '../../types/sport.ts';
import {
  CANCELLABLE_STATUSES,
  SLOT_HOLDING_STATUSES,
  type BookingStatus,
  type PaymentStatus,
} from '../../types/status.ts';

export type Booking = {
  id: number;
  user_id: number;
  venue_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: BookingStatus;
  total_harga: number;
  created_at: Date;
};

export type BookingSummary = Booking & {
  venue_nama: string;
  venue_kota: string;
  jenis_olahraga: Sport;
  harga_per_jam: number;
  payment_id: number | null;
  payment_status: PaymentStatus | null;
  payment_metode: string | null;
};

export type BookableVenue = {
  id: number;
  harga_per_jam: number;
  jam_buka: string;
  jam_tutup: string;
};

export type BookingRecord = {
  userId: number;
  venueId: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  totalHarga: number;
};

export const BOOKING_COLUMNS = `
  b.id, b.user_id, b.venue_id, to_char(b.tanggal, 'YYYY-MM-DD') AS tanggal,
  to_char(b.jam_mulai, 'HH24:MI') AS jam_mulai, to_char(b.jam_selesai, 'HH24:MI') AS jam_selesai,
  b.status, b.total_harga, b.created_at`;

// Booking + info lapangan + pembayaran terakhir (bila ada).
const SUMMARY_SELECT = `
  SELECT ${BOOKING_COLUMNS},
         v.nama AS venue_nama, v.kota AS venue_kota, v.jenis_olahraga, v.harga_per_jam,
         p.id AS payment_id, p.status AS payment_status, p.metode AS payment_metode
  FROM bookings b
  JOIN venues v ON v.id = b.venue_id
  LEFT JOIN LATERAL (
    SELECT id, status, metode FROM payments
    WHERE booking_id = b.id ORDER BY created_at DESC, id DESC LIMIT 1
  ) p ON true`;

/**
 * Data lapangan yang dibutuhkan untuk booking. Dengan `lock`, baris lapangan dikunci
 * (SELECT ... FOR UPDATE) sampai transaksi selesai, sehingga dua booking untuk lapangan
 * yang sama diproses bergantian, bukan bersamaan.
 */
export async function findBookableVenue(
  db: Db,
  venueId: number,
  options: { lock: boolean } = { lock: false },
): Promise<BookableVenue | undefined> {
  const { rows } = await db.query<BookableVenue>(
    `SELECT id, harga_per_jam,
            to_char(jam_buka, 'HH24:MI') AS jam_buka, to_char(jam_tutup, 'HH24:MI') AS jam_tutup
     FROM venues WHERE id = $1 ${options.lock ? 'FOR UPDATE' : ''}`,
    [venueId],
  );
  return rows[0];
}

/** Rentang jam yang sudah dipegang booking aktif pada lapangan dan tanggal tertentu. */
export async function listHeldRanges(
  db: Db,
  venueId: number,
  tanggal: string,
): Promise<{ jam_mulai: string; jam_selesai: string }[]> {
  const { rows } = await db.query<{ jam_mulai: string; jam_selesai: string }>(
    `SELECT to_char(jam_mulai, 'HH24:MI') AS jam_mulai, to_char(jam_selesai, 'HH24:MI') AS jam_selesai
     FROM bookings
     WHERE venue_id = $1 AND tanggal = $2 AND status = ANY($3)`,
    [venueId, tanggal, SLOT_HOLDING_STATUSES],
  );
  return rows;
}

/** Jumlah booking "menunggu" milik user yang belum punya pembayaran aktif. */
export async function countUnpaidBookings(db: Db, userId: number): Promise<number> {
  const { rows } = await db.query<{ jumlah: string }>(
    `SELECT COUNT(*) AS jumlah FROM bookings b
     WHERE b.user_id = $1 AND b.status = 'menunggu'
       AND NOT EXISTS (
         SELECT 1 FROM payments p
         WHERE p.booking_id = b.id AND p.status IN ('menunggu', 'lunas')
       )`,
    [userId],
  );
  return Number(rows[0]?.jumlah ?? 0);
}

export async function insertBooking(db: Db, record: BookingRecord): Promise<Booking> {
  const { rows } = await db.query<Booking>(
    `INSERT INTO bookings AS b (user_id, venue_id, tanggal, jam_mulai, jam_selesai, total_harga)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${BOOKING_COLUMNS}`,
    [
      record.userId,
      record.venueId,
      record.tanggal,
      record.jamMulai,
      record.jamSelesai,
      record.totalHarga,
    ],
  );
  const created = rows[0];
  if (!created) throw new Error('INSERT bookings tidak mengembalikan baris');
  return created;
}

/** Mengunci booking milik user selama transaksi; dipakai saat membayar. */
export async function lockOwnBooking(
  db: Db,
  bookingId: number,
  userId: number,
): Promise<Booking | undefined> {
  const { rows } = await db.query<Booking>(
    `SELECT ${BOOKING_COLUMNS} FROM bookings b
     WHERE b.id = $1 AND b.user_id = $2 FOR UPDATE`,
    [bookingId, userId],
  );
  return rows[0];
}

export async function findBookingSummary(id: number): Promise<BookingSummary | undefined> {
  const { rows } = await pool.query<BookingSummary>(`${SUMMARY_SELECT} WHERE b.id = $1`, [id]);
  return rows[0];
}

export async function listBookingSummariesByUser(userId: number): Promise<BookingSummary[]> {
  const { rows } = await pool.query<BookingSummary>(
    `${SUMMARY_SELECT} WHERE b.user_id = $1 ORDER BY b.tanggal DESC, b.jam_mulai DESC`,
    [userId],
  );
  return rows;
}

export async function setBookingStatus(
  db: Db,
  id: number,
  status: BookingStatus,
): Promise<Booking | undefined> {
  const { rows } = await db.query<Booking>(
    `UPDATE bookings AS b SET status = $2 WHERE b.id = $1 RETURNING ${BOOKING_COLUMNS}`,
    [id, status],
  );
  return rows[0];
}

/** Membatalkan booking hanya bila statusnya masih bisa dibatalkan (dicek ulang di SQL). */
export async function markBookingCancelled(
  db: Db,
  id: number,
  userId: number,
): Promise<Booking | undefined> {
  const { rows } = await db.query<Booking>(
    `UPDATE bookings AS b SET status = 'dibatalkan'
     WHERE b.id = $1 AND b.user_id = $2 AND b.status = ANY($3)
     RETURNING ${BOOKING_COLUMNS}`,
    [id, userId, CANCELLABLE_STATUSES],
  );
  return rows[0];
}
