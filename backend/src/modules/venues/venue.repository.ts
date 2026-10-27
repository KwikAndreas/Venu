import { isBeforeMode } from '../../config/env.ts';
import { pool } from '../../db/pool.ts';
import { createWhereBuilder, likePattern, type WhereBuilder } from '../../lib/sql-where.ts';
import type { Sport } from '../../types/sport.ts';
import type { NewVenue, VenueChanges } from './venue.input.ts';

export type Venue = {
  id: number;
  owner_id: number;
  nama: string;
  jenis_olahraga: Sport;
  alamat: string;
  kota: string;
  harga_per_jam: number;
  jam_buka: string;
  jam_tutup: string;
  fasilitas: string[];
  foto_url: string | null;
  deskripsi: string | null;
  created_at: Date;
  rating_rata: number | null;
  jumlah_ulasan: number;
};

export type VenueDetail = Venue & { nama_pemilik: string };

export const VENUE_SORTS = {
  terbaru: 'v.created_at DESC',
  harga_terendah: 'v.harga_per_jam ASC',
  harga_tertinggi: 'v.harga_per_jam DESC',
  nama: 'v.nama ASC',
} as const;

export type VenueSort = keyof typeof VENUE_SORTS;

export type VenueFilter = {
  jenis?: Sport;
  nama?: string;
  lokasi?: string;
  hargaMin?: number;
  hargaMax?: number;
  urut: VenueSort;
};

const VENUE_COLUMNS = `
  v.id, v.owner_id, v.nama, v.jenis_olahraga, v.alamat, v.kota, v.harga_per_jam,
  to_char(v.jam_buka, 'HH24:MI') AS jam_buka, to_char(v.jam_tutup, 'HH24:MI') AS jam_tutup,
  v.fasilitas, v.foto_url, v.deskripsi, v.created_at,
  (SELECT ROUND(AVG(r.rating), 1)::float8 FROM reviews r WHERE r.venue_id = v.id) AS rating_rata,
  (SELECT COUNT(*)::int FROM reviews r WHERE r.venue_id = v.id) AS jumlah_ulasan`;

function buildWhere(filter: VenueFilter): WhereBuilder {
  const where = createWhereBuilder();
  if (filter.jenis) where.add((p) => `v.jenis_olahraga = ${p}`, filter.jenis);
  if (filter.nama) where.add((p) => `v.nama ILIKE ${p}`, likePattern(filter.nama));
  if (filter.lokasi) {
    where.add((p) => `(v.kota ILIKE ${p} OR v.alamat ILIKE ${p})`, likePattern(filter.lokasi));
  }
  if (filter.hargaMin) where.add((p) => `v.harga_per_jam >= ${p}`, filter.hargaMin);
  if (filter.hargaMax) where.add((p) => `v.harga_per_jam <= ${p}`, filter.hargaMax);
  return where;
}

/**
 * [VULN-A05] Mode before: nilai pencarian `nama` dan `lokasi` digabung langsung ke string SQL
 * tanpa parameter, sehingga bisa disisipi SQL injection lewat Burp/ZAP, mis.
 *   GET /venues?q=' OR '1'='1   atau   q=' UNION SELECT ... --
 */
function listVenuesBefore(filter: VenueFilter): Promise<Venue[]> {
  const conditions: string[] = [];
  if (filter.jenis) conditions.push(`v.jenis_olahraga = '${filter.jenis}'`);
  if (filter.nama) conditions.push(`v.nama ILIKE '%${filter.nama}%'`);
  if (filter.lokasi) {
    conditions.push(`(v.kota ILIKE '%${filter.lokasi}%' OR v.alamat ILIKE '%${filter.lokasi}%')`);
  }
  if (filter.hargaMin) conditions.push(`v.harga_per_jam >= ${filter.hargaMin}`);
  if (filter.hargaMax) conditions.push(`v.harga_per_jam <= ${filter.hargaMax}`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return pool
    .query<Venue>(
      `SELECT ${VENUE_COLUMNS} FROM venues v ${where} ORDER BY ${VENUE_SORTS[filter.urut]}, v.id`,
    )
    .then((result) => result.rows);
}

export async function listVenues(filter: VenueFilter): Promise<Venue[]> {
  if (isBeforeMode) return listVenuesBefore(filter);

  // [FIXED-A05] Semua nilai pencarian dikirim sebagai parameter ($1, $2, ...), tidak pernah
  // digabung ke teks SQL, sehingga input apa pun diperlakukan sebagai data, bukan perintah.
  const where = buildWhere(filter);
  const { rows } = await pool.query<Venue>(
    `SELECT ${VENUE_COLUMNS} FROM venues v ${where.clause()}
     ORDER BY ${VENUE_SORTS[filter.urut]}, v.id`,
    where.params,
  );
  return rows;
}

export async function listVenuesByOwner(ownerId: number): Promise<Venue[]> {
  const { rows } = await pool.query<Venue>(
    `SELECT ${VENUE_COLUMNS} FROM venues v WHERE v.owner_id = $1 ORDER BY v.created_at DESC`,
    [ownerId],
  );
  return rows;
}

export async function findVenueById(id: number): Promise<VenueDetail | undefined> {
  const { rows } = await pool.query<VenueDetail>(
    `SELECT ${VENUE_COLUMNS}, u.nama AS nama_pemilik
     FROM venues v JOIN users u ON u.id = v.owner_id
     WHERE v.id = $1`,
    [id],
  );
  return rows[0];
}

export async function insertVenue(ownerId: number, venue: NewVenue): Promise<Venue> {
  const columns = ['owner_id', ...Object.keys(venue)];
  const values = [ownerId, ...Object.values(venue)];
  const placeholders = values.map((_, index) => `$${index + 1}`);

  const { rows } = await pool.query<Venue>(
    `INSERT INTO venues AS v (${columns.join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING ${VENUE_COLUMNS}`,
    values,
  );
  const created = rows[0];
  if (!created) throw new Error('INSERT venues tidak mengembalikan baris');
  return created;
}

/**
 * Mengubah lapangan milik `ownerId`. Nama kolom berasal dari parser (venue.input.ts),
 * bukan dari klien, sedangkan nilainya selalu lewat placeholder.
 * Mengembalikan undefined bila lapangan tidak ada atau bukan milik `ownerId`.
 */
export async function updateVenue(
  id: number,
  ownerId: number,
  changes: VenueChanges,
): Promise<Venue | undefined> {
  const entries = Object.entries(changes);
  const assignments = entries.map(([column], index) => `${column} = $${index + 1}`);
  const params = [...entries.map(([, value]) => value), id, ownerId];

  const { rows } = await pool.query<Venue>(
    `UPDATE venues AS v SET ${assignments.join(', ')}
     WHERE v.id = $${entries.length + 1} AND v.owner_id = $${entries.length + 2}
     RETURNING ${VENUE_COLUMNS}`,
    params,
  );
  return rows[0];
}

/** Kunci file upload milik lapangan: foto lokal dan bukti bayar dari booking-nya. */
export async function listVenueUploadKeys(venueId: number): Promise<string[]> {
  const { rows } = await pool.query<{ key: string }>(
    `SELECT substring(foto_url FROM ${'/uploads/'.length + 1}) AS key
     FROM venues WHERE id = $1 AND foto_url LIKE '/uploads/%'
     UNION ALL
     SELECT p.bukti_url FROM payments p JOIN bookings b ON b.id = p.booking_id
     WHERE b.venue_id = $1 AND p.bukti_url IS NOT NULL`,
    [venueId],
  );
  return rows.map((row) => row.key);
}

/** Menghapus lapangan milik `ownerId`; false bila tidak ada atau bukan miliknya. */
export async function deleteVenue(id: number, ownerId: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM venues WHERE id = $1 AND owner_id = $2', [
    id,
    ownerId,
  ]);
  return result.rowCount === 1;
}
