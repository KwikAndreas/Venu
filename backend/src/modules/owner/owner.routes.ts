import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import {
  optionalPositiveInt,
  optionalString,
  parseIdParam,
  queryValue,
} from '../../lib/request.ts';
import { addDays, nowInJakarta } from '../../lib/time.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import { isBookingStatus } from '../../types/status.ts';
import { parseDate } from '../bookings/booking.input.ts';
import {
  confirmBooking,
  getOwnerStats,
  listIncomingBookings,
  rejectBooking,
} from './owner.service.ts';

const DEFAULT_STATS_DAYS = 30;

export const ownerRouter = Router();

ownerRouter.use(requireAuth, requireRole('pemilik'));

// GET /owner/stats?dari=2026-10-01&sampai=2026-10-31 (default: 30 hari terakhir)
ownerRouter.get('/stats', async (req, res) => {
  const today = nowInJakarta().date;
  const sampai = parseDate(queryValue(req.query, 'sampai') ?? today, 'sampai');
  const dari = parseDate(
    queryValue(req.query, 'dari') ?? addDays(sampai, -(DEFAULT_STATS_DAYS - 1)),
    'dari',
  );
  res.json(await getOwnerStats(getAuthUser(req).id, { dari, sampai }));
});

// GET /owner/bookings?status=menunggu&venue_id=1&tanggal=2026-11-01
ownerRouter.get('/bookings', async (req, res) => {
  const status = queryValue(req.query, 'status');
  if (status !== undefined && !isBookingStatus(status)) {
    throw new HttpError(400, 'Parameter "status" tidak dikenal');
  }
  const tanggal = queryValue(req.query, 'tanggal');

  const bookings = await listIncomingBookings(getAuthUser(req).id, {
    status,
    venueId: optionalPositiveInt(req.query, 'venue_id'),
    tanggal: tanggal === undefined ? undefined : parseDate(tanggal),
  });
  res.json({ bookings });
});

ownerRouter.post('/bookings/:id/confirm', async (req, res) => {
  const booking = await confirmBooking(
    getAuthUser(req).id,
    parseIdParam(req.params.id),
    req.ip ?? null,
  );
  res.json({ booking });
});

// Body opsional: { alasan }
ownerRouter.post('/bookings/:id/reject', async (req, res) => {
  const booking = await rejectBooking(
    getAuthUser(req).id,
    parseIdParam(req.params.id),
    optionalString(req.body, 'alasan'),
    req.ip ?? null,
  );
  res.json({ booking });
});
