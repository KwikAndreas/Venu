import { pool } from '../../db/pool.ts';
import type { Db } from '../../db/transaction.ts';
import type { PaymentMethod, PaymentStatus } from '../../types/status.ts';

export type Payment = {
  id: number;
  booking_id: number;
  jumlah: number;
  metode: PaymentMethod;
  status: PaymentStatus;
  ada_bukti: boolean;
  created_at: Date;
};

export type PaymentRecord = {
  bookingId: number;
  jumlah: number;
  metode: PaymentMethod;
  buktiKey: string;
};

/** Data yang dibutuhkan untuk memutuskan siapa boleh melihat bukti bayar. */
export type PaymentProofAccess = {
  bukti_url: string | null;
  payer_id: number;
  owner_id: number;
};

// Lokasi file bukti tidak dikirim ke klien; cukup penanda `ada_bukti`.
const PAYMENT_COLUMNS = `
  p.id, p.booking_id, p.jumlah, p.metode, p.status,
  (p.bukti_url IS NOT NULL) AS ada_bukti, p.created_at`;

export async function hasActivePayment(db: Db, bookingId: number): Promise<boolean> {
  const { rows } = await db.query(
    `SELECT 1 FROM payments WHERE booking_id = $1 AND status IN ('menunggu', 'lunas') LIMIT 1`,
    [bookingId],
  );
  return rows.length > 0;
}

export async function insertPayment(db: Db, record: PaymentRecord): Promise<Payment> {
  const { rows } = await db.query<Payment>(
    `INSERT INTO payments AS p (booking_id, jumlah, metode, bukti_url)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PAYMENT_COLUMNS}`,
    [record.bookingId, record.jumlah, record.metode, record.buktiKey],
  );
  const created = rows[0];
  if (!created) throw new Error('INSERT payments tidak mengembalikan baris');
  return created;
}

/** Pembayaran yang masih menunggu verifikasi dianggap gagal (mis. karena booking dibatalkan). */
export async function failPendingPayments(db: Db, bookingId: number): Promise<void> {
  await db.query(
    `UPDATE payments SET status = 'gagal' WHERE booking_id = $1 AND status = 'menunggu'`,
    [bookingId],
  );
}

export async function findPaymentProofAccess(
  paymentId: number,
): Promise<PaymentProofAccess | undefined> {
  const { rows } = await pool.query<PaymentProofAccess>(
    `SELECT p.bukti_url, b.user_id AS payer_id, v.owner_id
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN venues v ON v.id = b.venue_id
     WHERE p.id = $1`,
    [paymentId],
  );
  return rows[0];
}
