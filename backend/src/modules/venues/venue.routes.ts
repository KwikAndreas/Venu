import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { optionalPositiveInt, parseIdParam, queryValue } from '../../lib/request.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import { isSport } from '../../types/sport.ts';
import { parseNewVenue, parseVenueChanges } from './venue.input.ts';
import { VENUE_SORTS, type VenueFilter, type VenueSort } from './venue.repository.ts';
import {
  createVenue,
  deleteOwnVenue,
  getOwnerVenues,
  getVenue,
  searchVenues,
  updateOwnVenue,
} from './venue.service.ts';

export const venueRouter = Router();

const onlyOwner = [requireAuth, requireRole('pemilik')];

function isVenueSort(value: string): value is VenueSort {
  return Object.hasOwn(VENUE_SORTS, value);
}

function parseFilter(query: Record<string, unknown>): VenueFilter {
  const jenis = queryValue(query, 'jenis');
  if (jenis !== undefined && !isSport(jenis)) {
    throw new HttpError(400, 'Parameter "jenis" harus futsal, badminton, atau basket');
  }
  const urut = queryValue(query, 'urut') ?? 'terbaru';

  return {
    jenis,
    nama: queryValue(query, 'q'),
    lokasi: queryValue(query, 'lokasi'),
    hargaMin: optionalPositiveInt(query, 'harga_min'),
    hargaMax: optionalPositiveInt(query, 'harga_max'),
    urut: isVenueSort(urut) ? urut : 'terbaru',
  };
}

// Publik: GET /venues?jenis=futsal&q=arena&lokasi=bandung&harga_min=50000&harga_max=200000&urut=harga_terendah
venueRouter.get('/', async (req, res) => {
  const venues = await searchVenues(parseFilter(req.query));
  res.json({ venues });
});

// Pemilik: daftar lapangan miliknya sendiri. Didaftarkan sebelum '/:id'.
venueRouter.get('/mine', ...onlyOwner, async (req, res) => {
  const venues = await getOwnerVenues(getAuthUser(req).id);
  res.json({ venues });
});

venueRouter.get('/:id', async (req, res) => {
  const venue = await getVenue(parseIdParam(req.params.id));
  res.json({ venue });
});

venueRouter.post('/', ...onlyOwner, async (req, res) => {
  const venue = await createVenue(getAuthUser(req).id, parseNewVenue(req.body));
  res.status(201).json({ venue });
});

venueRouter.patch('/:id', ...onlyOwner, async (req, res) => {
  const venue = await updateOwnVenue(
    parseIdParam(req.params.id),
    getAuthUser(req).id,
    parseVenueChanges(req.body),
  );
  res.json({ venue });
});

venueRouter.delete('/:id', ...onlyOwner, async (req, res) => {
  await deleteOwnVenue(parseIdParam(req.params.id), getAuthUser(req).id);
  res.status(204).end();
});
