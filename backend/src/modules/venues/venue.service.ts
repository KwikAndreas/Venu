import { HttpError } from '../../lib/http-error.ts';
import type { NewVenue, VenueChanges } from './venue.input.ts';
import {
  deleteVenue,
  findVenueById,
  insertVenue,
  listVenues,
  listVenuesByOwner,
  updateVenue,
  type Venue,
  type VenueDetail,
  type VenueFilter,
} from './venue.repository.ts';

const NOT_FOUND_MESSAGE = 'Lapangan tidak ditemukan';

export function searchVenues(filter: VenueFilter): Promise<Venue[]> {
  if (filter.hargaMin && filter.hargaMax && filter.hargaMin > filter.hargaMax) {
    throw new HttpError(400, 'harga_min tidak boleh lebih besar dari harga_max');
  }
  return listVenues(filter);
}

export function getOwnerVenues(ownerId: number): Promise<Venue[]> {
  return listVenuesByOwner(ownerId);
}

export async function getVenue(id: number): Promise<VenueDetail> {
  const venue = await findVenueById(id);
  if (!venue) throw new HttpError(404, NOT_FOUND_MESSAGE);
  return venue;
}

export function createVenue(ownerId: number, venue: NewVenue): Promise<Venue> {
  return insertVenue(ownerId, venue);
}

// Lapangan milik pemilik lain dijawab 404 (bukan 403) agar keberadaannya tidak bocor.
export async function updateOwnVenue(
  id: number,
  ownerId: number,
  changes: VenueChanges,
): Promise<Venue> {
  const venue = await updateVenue(id, ownerId, changes);
  if (!venue) throw new HttpError(404, NOT_FOUND_MESSAGE);
  return venue;
}

export async function deleteOwnVenue(id: number, ownerId: number): Promise<void> {
  const deleted = await deleteVenue(id, ownerId);
  if (!deleted) throw new HttpError(404, NOT_FOUND_MESSAGE);
}
