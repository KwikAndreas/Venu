import { pool } from '../../db/pool.ts';
import type { Db } from '../../db/transaction.ts';
import { createWhereBuilder } from '../../lib/sql-where.ts';
import type { BookingStatus, PaymentStatus } from '../../types/status.ts';
import { BOOKING_COLUMNS, type Booking } from '../bookings/booking.repository.ts';

export type VenueStats = {
  venue_id: number;
  nama: string;
  jumlah_booking: number;
  booking_menunggu: number;
  booking_terkonfirmasi: number;
  jam_terpakai: number;
  jam_tersedia: number;
  pendapatan: number;
};

export type OwnerBooking = Booking & {
  venue_nama: string;
  penyewa_nama: string;
  penyewa_email: string;
  payment_id: number | null;
  payment_status: PaymentStatus | null;
  payment_metode: string | null;
  ada_bukti: boolean;
};

export type OwnerBookingFilter = {
  status?: BookingStatus;
  venueId?: number;
  tanggal?: string;
};

/**
 * Statistik per lapangan milik `ownerId` untuk periode `dari`..`sampai` (`hari` = panjang periode).
 * Okupansi dan pendapatan hanya menghitung booking yang dikonfirmasi/selesai dan pembayaran lunas.
 */
export async function getVenueStats(
  ownerId: number,
  period: { dari: string; sampai: string; hari: number },
): Promise<VenueStats[]> {
  const { rows } = await pool.query<VenueStats>(
    `SELECT v.id AS venue_id, v.nama,
       COUNT(b.id)::int AS jumlah_booking,
       COUNT(b.id) FILTER (WHERE b.status = 'menunggu')::int AS booking_menunggu,
       COUNT(b.id) FILTER (WHERE b.status IN ('dikonfirmasi', 'selesai'))::int AS booking_terkonfirmasi,
       COALESCE(SUM(EXTRACT(EPOCH FROM b.jam_selesai - b.jam_mulai) / 3600)
         FILTER (WHERE b.status IN ('dikonfirmasi', 'selesai')), 0)::float8 AS jam_terpakai,
       (FLOOR(EXTRACT(EPOCH FROM v.jam_tutup - v.jam_buka) / 3600) * $4)::float8 AS jam_tersedia,
       COALESCE((
         SELECT SUM(p.jumlah) FROM payments p JOIN bookings pb ON pb.id = p.booking_id
         WHERE pb.venue_id = v.id AND p.status = 'lunas' AND pb.tanggal BETWEEN $2 AND $3
       ), 0)::float8 AS pendapatan
     FROM venues v
     LEFT JOIN bookings b ON b.venue_id = v.id AND b.tanggal BETWEEN $2 AND $3
     WHERE v.owner_id = $1
     GROUP BY v.id
     ORDER BY v.nama`,
    [ownerId, period.dari, period.sampai, period.hari],
  );
  return rows;
}

export async function listOwnerBookings(
  ownerId: number,
  filter: OwnerBookingFilter,
): Promise<OwnerBooking[]> {
  const where = createWhereBuilder([ownerId]);
  where.raw('v.owner_id = $1');
  if (filter.status) where.add((p) => `b.status = ${p}`, filter.status);
  if (filter.venueId) where.add((p) => `b.venue_id = ${p}`, filter.venueId);
  if (filter.tanggal) where.add((p) => `b.tanggal = ${p}`, filter.tanggal);

  const { rows } = await pool.query<OwnerBooking>(
    `SELECT ${BOOKING_COLUMNS},
            v.nama AS venue_nama, u.nama AS penyewa_nama, u.email AS penyewa_email,
            p.id AS payment_id, p.status AS payment_status, p.metode AS payment_metode,
            COALESCE(p.bukti_url IS NOT NULL, false) AS ada_bukti
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     JOIN users u ON u.id = b.user_id
     LEFT JOIN LATERAL (
       SELECT id, status, metode, bukti_url FROM payments
       WHERE booking_id = b.id ORDER BY created_at DESC, id DESC LIMIT 1
     ) p ON true
     ${where.clause()}
     ORDER BY b.tanggal DESC, b.jam_mulai DESC
     LIMIT 200`,
    where.params,
  );
  return rows;
}

/** Mengunci booking yang lapangannya dimiliki `ownerId`; undefined bila tidak ada/bukan miliknya. */
export async function lockOwnerBooking(
  db: Db,
  bookingId: number,
  ownerId: number,
): Promise<Booking | undefined> {
  const { rows } = await db.query<Booking>(
    `SELECT ${BOOKING_COLUMNS}
     FROM bookings b JOIN venues v ON v.id = b.venue_id
     WHERE b.id = $1 AND v.owner_id = $2
     FOR UPDATE OF b`,
    [bookingId, ownerId],
  );
  return rows[0];
}
