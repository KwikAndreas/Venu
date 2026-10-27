import { IMAGE_TYPES } from '../../lib/file-type.ts';
import { HttpError } from '../../lib/http-error.ts';
import { removeUpload, saveUpload } from '../../lib/storage.ts';
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
const LOCAL_PHOTO_PREFIX = '/uploads/';

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

/** Mengganti foto lapangan dengan file gambar yang diunggah; foto lokal lama dihapus. */
export async function replaceVenuePhoto(
  id: number,
  ownerId: number,
  photo: Buffer,
): Promise<Venue> {
  const current = await findVenueById(id);
  if (!current || current.owner_id !== ownerId) throw new HttpError(404, NOT_FOUND_MESSAGE);

  const saved = await saveUpload('venues', photo, IMAGE_TYPES);
  let updated: Venue;
  try {
    updated = await updateOwnVenue(id, ownerId, { foto_url: `${LOCAL_PHOTO_PREFIX}${saved.key}` });
  } catch (error) {
    await removeUpload(saved.key);
    throw error;
  }

  if (current.foto_url?.startsWith(LOCAL_PHOTO_PREFIX)) {
    await removeUpload(current.foto_url.slice(LOCAL_PHOTO_PREFIX.length)).catch(() => undefined);
  }
  return updated;
}

export async function deleteOwnVenue(id: number, ownerId: number): Promise<void> {
  const deleted = await deleteVenue(id, ownerId);
  if (!deleted) throw new HttpError(404, NOT_FOUND_MESSAGE);
}
