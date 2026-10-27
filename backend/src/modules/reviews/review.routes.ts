import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { optionalString, parseIdParam, requirePositiveInt } from '../../lib/request.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import {
  createReview,
  deleteReview,
  listVenueReviews,
  type ReviewInput,
} from './review.service.ts';

const MAX_COMMENT_LENGTH = 1000;

export const reviewRouter = Router();

function parseReviewInput(body: unknown): ReviewInput {
  const rating = requirePositiveInt(body, 'rating');
  if (rating > 5) throw new HttpError(400, 'Field "rating" harus 1 sampai 5');

  const komentar = optionalString(body, 'komentar') ?? null;
  if (komentar && komentar.length > MAX_COMMENT_LENGTH) {
    throw new HttpError(400, `Komentar maksimal ${MAX_COMMENT_LENGTH} karakter`);
  }
  return { rating, komentar };
}

reviewRouter.get('/venues/:id/reviews', async (req, res) => {
  res.json({ reviews: await listVenueReviews(parseIdParam(req.params.id)) });
});

// Body: { rating: 1-5, komentar? }
reviewRouter.post('/venues/:id/reviews', requireAuth, requireRole('penyewa'), async (req, res) => {
  const review = await createReview(
    getAuthUser(req).id,
    parseIdParam(req.params.id),
    parseReviewInput(req.body),
  );
  res.status(201).json({ review });
});

reviewRouter.delete('/reviews/:id', requireAuth, async (req, res) => {
  await deleteReview(getAuthUser(req), parseIdParam(req.params.id), req.ip ?? null);
  res.status(204).end();
});
