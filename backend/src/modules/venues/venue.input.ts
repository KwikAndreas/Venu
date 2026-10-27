import { HttpError } from '../../lib/http-error.ts';
import {
  optionalPositiveInt,
  optionalString,
  optionalStringArray,
  requirePositiveInt,
  requireString,
} from '../../lib/request.ts';
import { isSport, type Sport } from '../../types/sport.ts';

export type NewVenue = {
  nama: string;
  jenis_olahraga: Sport;
  alamat: string;
  kota: string;
  harga_per_jam: number;
  jam_buka?: string;
  jam_tutup?: string;
  fasilitas?: string[];
  foto_url?: string;
  deskripsi?: string;
};

export type VenueChanges = Partial<NewVenue>;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHOTO_URL_PATTERN = /^https?:\/\//i;

function optionalSport(body: unknown): Sport | undefined {
  const value = optionalString(body, 'jenis_olahraga');
  if (value === undefined) return undefined;
  if (!isSport(value)) {
    throw new HttpError(400, 'Field "jenis_olahraga" harus futsal, badminton, atau basket');
  }
  return value;
}

function optionalTime(body: unknown, field: string): string | undefined {
  const value = optionalString(body, field);
  if (value !== undefined && !TIME_PATTERN.test(value)) {
    throw new HttpError(400, `Field "${field}" harus berformat JJ:MM, contoh 08:00`);
  }
  return value;
}

function optionalPhotoUrl(body: unknown): string | undefined {
  const value = optionalString(body, 'foto_url');
  if (value !== undefined && !PHOTO_URL_PATTERN.test(value)) {
    throw new HttpError(400, 'Field "foto_url" harus diawali http:// atau https://');
  }
  return value;
}

function withoutUndefined<T extends object>(object: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function parseNewVenue(body: unknown): NewVenue {
  const jenis = optionalSport(body);
  if (!jenis) throw new HttpError(400, 'Field "jenis_olahraga" wajib diisi');

  return {
    nama: requireString(body, 'nama'),
    jenis_olahraga: jenis,
    alamat: requireString(body, 'alamat'),
    kota: requireString(body, 'kota'),
    harga_per_jam: requirePositiveInt(body, 'harga_per_jam'),
    ...withoutUndefined({
      jam_buka: optionalTime(body, 'jam_buka'),
      jam_tutup: optionalTime(body, 'jam_tutup'),
      fasilitas: optionalStringArray(body, 'fasilitas'),
      foto_url: optionalPhotoUrl(body),
      deskripsi: optionalString(body, 'deskripsi'),
    }),
  };
}

export function parseVenueChanges(body: unknown): VenueChanges {
  const changes = withoutUndefined<VenueChanges>({
    nama: optionalString(body, 'nama'),
    jenis_olahraga: optionalSport(body),
    alamat: optionalString(body, 'alamat'),
    kota: optionalString(body, 'kota'),
    harga_per_jam: optionalPositiveInt(body, 'harga_per_jam'),
    jam_buka: optionalTime(body, 'jam_buka'),
    jam_tutup: optionalTime(body, 'jam_tutup'),
    fasilitas: optionalStringArray(body, 'fasilitas'),
    foto_url: optionalPhotoUrl(body),
    deskripsi: optionalString(body, 'deskripsi'),
  });

  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, 'Tidak ada field yang diubah');
  }
  return changes;
}
