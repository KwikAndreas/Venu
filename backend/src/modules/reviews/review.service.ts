import { HttpError } from '../../lib/http-error.ts';
import type { AuthUser } from '../../lib/jwt.ts';
import { nowInJakarta } from '../../lib/time.ts';
import { recordAudit } from '../audit/audit.service.ts';
import { getVenue } from '../venues/venue.service.ts';
import {
  deleteReviewById,
  findReviewById,
  hasPlayedAt,
  hasReviewed,
  insertReview,
  listReviewsByVenue,
  type Review,
} from './review.repository.ts';

export type ReviewInput = {
  rating: number;
  komentar: string | null;
};

export async function listVenueReviews(venueId: number): Promise<Review[]> {
  await getVenue(venueId); // 404 bila lapangan tidak ada
  return listReviewsByVenue(venueId);
}

/** Hanya penyewa yang pernah bermain di lapangan ini yang boleh memberi ulasan, satu kali. */
export async function createReview(
  userId: number,
  venueId: number,
  input: ReviewInput,
): Promise<Review> {
  await getVenue(venueId);
  if (!(await hasPlayedAt(userId, venueId, nowInJakarta().date))) {
    throw new HttpError(403, 'Ulasan hanya untuk penyewa yang sudah bermain di lapangan ini');
  }
  if (await hasReviewed(userId, venueId)) {
    throw new HttpError(409, 'Anda sudah memberi ulasan untuk lapangan ini');
  }
  return insertReview({ userId, venueId, ...input });
}

/** Ulasan boleh dihapus oleh penulisnya atau admin (moderasi). */
export async function deleteReview(
  user: AuthUser,
  reviewId: number,
  ip: string | null,
): Promise<void> {
  const review = await findReviewById(reviewId);
  const allowed = review !== undefined && (review.user_id === user.id || user.role === 'admin');
  if (!allowed) throw new HttpError(404, 'Ulasan tidak ditemukan');

  await deleteReviewById(reviewId);
  if (review.user_id !== user.id) {
    await recordAudit({
      userId: user.id,
      aksi: 'admin.hapus_ulasan',
      detail: { review_id: reviewId, venue_id: review.venue_id, penulis_id: review.user_id },
      ip,
    });
  }
}
