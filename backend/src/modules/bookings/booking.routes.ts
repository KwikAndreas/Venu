import { Router } from 'express';
import { parseIdParam, queryValue } from '../../lib/request.ts';
import { nowInJakarta } from '../../lib/time.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import { parseDate, parseNewBooking } from './booking.input.ts';
import {
  cancelOwnBooking,
  createBooking,
  getOwnBooking,
  getVenueSlots,
  listOwnBookings,
} from './booking.service.ts';

export const bookingRouter = Router();

const onlyRenter = [requireAuth, requireRole('penyewa')];

// Publik: GET /venues/:id/slots?tanggal=2026-11-01 (default: hari ini)
bookingRouter.get('/venues/:id/slots', async (req, res) => {
  const tanggal = parseDate(queryValue(req.query, 'tanggal') ?? nowInJakarta().date);
  res.json(await getVenueSlots(parseIdParam(req.params.id), tanggal));
});

bookingRouter.post('/bookings', ...onlyRenter, async (req, res) => {
  const booking = await createBooking(getAuthUser(req).id, parseNewBooking(req.body));
  res.status(201).json({ booking });
});

// Riwayat booking milik penyewa yang login. Didaftarkan sebelum '/bookings/:id'.
bookingRouter.get('/bookings/mine', ...onlyRenter, async (req, res) => {
  res.json({ bookings: await listOwnBookings(getAuthUser(req).id) });
});

bookingRouter.get('/bookings/:id', ...onlyRenter, async (req, res) => {
  const booking = await getOwnBooking(getAuthUser(req).id, parseIdParam(req.params.id));
  res.json({ booking });
});

bookingRouter.post('/bookings/:id/cancel', ...onlyRenter, async (req, res) => {
  const booking = await cancelOwnBooking(getAuthUser(req).id, parseIdParam(req.params.id));
  res.json({ booking });
});
