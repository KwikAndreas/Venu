import { pool } from '../../db/pool.ts';
import { createWhereBuilder, likePattern } from '../../lib/sql-where.ts';
import type { Role } from '../../types/role.ts';
import type { Sport } from '../../types/sport.ts';
import type { PublicUser } from '../users/user.repository.ts';

export type UserFilter = { role?: Role; q?: string };

export type AdminVenue = {
  id: number;
  nama: string;
  jenis_olahraga: Sport;
  kota: string;
  harga_per_jam: number;
  owner_id: number;
  nama_pemilik: string;
  email_pemilik: string;
  jumlah_booking: number;
  created_at: Date;
};

export type AdminSummary = {
  users: Record<Role, number>;
  jumlah_lapangan: number;
  jumlah_booking: number;
  booking_menunggu: number;
  pembayaran_lunas: number;
  login_gagal_24_jam: number;
};

export async function listUsers(filter: UserFilter): Promise<PublicUser[]> {
  const where = createWhereBuilder();
  if (filter.role) where.add((p) => `role = ${p}`, filter.role);
  if (filter.q) where.add((p) => `(nama ILIKE ${p} OR email ILIKE ${p})`, likePattern(filter.q));

  const { rows } = await pool.query<PublicUser>(
    `SELECT id, nama, email, role, created_at FROM users ${where.clause()} ORDER BY id`,
    where.params,
  );
  return rows;
}

export async function updateUserRole(id: number, role: Role): Promise<PublicUser | undefined> {
  const { rows } = await pool.query<PublicUser>(
    'UPDATE users SET role = $2 WHERE id = $1 RETURNING id, nama, email, role, created_at',
    [id, role],
  );
  return rows[0];
}

export async function deleteUserById(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount === 1;
}

/** File upload yang ikut terhapus bersama user: foto lapangannya dan bukti bayar terkait. */
export async function listUserUploadKeys(userId: number): Promise<string[]> {
  const { rows } = await pool.query<{ key: string }>(
    `SELECT substring(foto_url FROM ${'/uploads/'.length + 1}) AS key
     FROM venues WHERE owner_id = $1 AND foto_url LIKE '/uploads/%'
     UNION ALL
     SELECT p.bukti_url FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN venues v ON v.id = b.venue_id
     WHERE (b.user_id = $1 OR v.owner_id = $1) AND p.bukti_url IS NOT NULL`,
    [userId],
  );
  return rows.map((row) => row.key);
}

export async function listAllVenues(q: string | undefined): Promise<AdminVenue[]> {
  const where = createWhereBuilder();
  if (q) where.add((p) => `(v.nama ILIKE ${p} OR v.kota ILIKE ${p})`, likePattern(q));

  const { rows } = await pool.query<AdminVenue>(
    `SELECT v.id, v.nama, v.jenis_olahraga, v.kota, v.harga_per_jam, v.created_at,
            u.id AS owner_id, u.nama AS nama_pemilik, u.email AS email_pemilik,
            (SELECT COUNT(*)::int FROM bookings b WHERE b.venue_id = v.id) AS jumlah_booking
     FROM venues v JOIN users u ON u.id = v.owner_id
     ${where.clause()}
     ORDER BY v.id`,
    where.params,
  );
  return rows;
}

export async function deleteVenueById(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM venues WHERE id = $1', [id]);
  return result.rowCount === 1;
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const { rows } = await pool.query<
    Omit<AdminSummary, 'users'> & { users: Record<string, number> }
  >(
    `SELECT
       (SELECT COALESCE(jsonb_object_agg(role, jumlah), '{}'::jsonb)
          FROM (SELECT role, COUNT(*)::int AS jumlah FROM users GROUP BY role) r) AS users,
       (SELECT COUNT(*)::int FROM venues) AS jumlah_lapangan,
       (SELECT COUNT(*)::int FROM bookings) AS jumlah_booking,
       (SELECT COUNT(*)::int FROM bookings WHERE status = 'menunggu') AS booking_menunggu,
       (SELECT COUNT(*)::int FROM payments WHERE status = 'lunas') AS pembayaran_lunas,
       (SELECT COUNT(*)::int FROM audit_logs
          WHERE aksi = 'auth.login_gagal' AND created_at > now() - interval '24 hours') AS login_gagal_24_jam`,
  );
  const row = rows[0];
  if (!row) throw new Error('Ringkasan admin kosong');
  return {
    ...row,
    users: { penyewa: 0, pemilik: 0, admin: 0, ...row.users },
  };
}
