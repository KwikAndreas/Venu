import { pool } from '../../db/pool.ts';

export type Review = {
  id: number;
  user_id: number;
  venue_id: number;
  nama_user: string;
  rating: number;
  komentar: string | null;
  created_at: Date;
};

export type NewReview = {
  userId: number;
  venueId: number;
  rating: number;
  komentar: string | null;
};

const REVIEW_COLUMNS = `
  r.id, r.user_id, r.venue_id, u.nama AS nama_user, r.rating, r.komentar, r.created_at`;

export async function listReviewsByVenue(venueId: number): Promise<Review[]> {
  const { rows } = await pool.query<Review>(
    `SELECT ${REVIEW_COLUMNS} FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.venue_id = $1 ORDER BY r.created_at DESC, r.id DESC`,
    [venueId],
  );
  return rows;
}

export async function hasReviewed(userId: number, venueId: number): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM reviews WHERE user_id = $1 AND venue_id = $2 LIMIT 1',
    [userId, venueId],
  );
  return rows.length > 0;
}

/** Penyewa dianggap sudah bermain bila punya booking terkonfirmasi/selesai sampai `today`. */
export async function hasPlayedAt(
  userId: number,
  venueId: number,
  today: string,
): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM bookings
     WHERE user_id = $1 AND venue_id = $2 AND status IN ('dikonfirmasi', 'selesai') AND tanggal <= $3
     LIMIT 1`,
    [userId, venueId, today],
  );
  return rows.length > 0;
}

export async function insertReview(review: NewReview): Promise<Review> {
  const { rows } = await pool.query<Review>(
    `WITH r AS (
       INSERT INTO reviews (user_id, venue_id, rating, komentar)
       VALUES ($1, $2, $3, $4) RETURNING *
     )
     SELECT ${REVIEW_COLUMNS} FROM r JOIN users u ON u.id = r.user_id`,
    [review.userId, review.venueId, review.rating, review.komentar],
  );
  const created = rows[0];
  if (!created) throw new Error('INSERT reviews tidak mengembalikan baris');
  return created;
}

export async function findReviewById(id: number): Promise<Review | undefined> {
  const { rows } = await pool.query<Review>(
    `SELECT ${REVIEW_COLUMNS} FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = $1`,
    [id],
  );
  return rows[0];
}

export async function deleteReviewById(id: number): Promise<void> {
  await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
}
