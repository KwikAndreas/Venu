import { HttpError } from '../../lib/http-error.ts';
import { requirePositiveInt, requireString } from '../../lib/request.ts';
import { isValidDate, isValidTime } from '../../lib/time.ts';

export type NewBooking = {
  venue_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
};

export function parseDate(value: string, field = 'tanggal'): string {
  if (!isValidDate(value)) {
    throw new HttpError(400, `"${field}" harus tanggal valid berformat YYYY-MM-DD`);
  }
  return value;
}

function requireTime(body: unknown, field: string): string {
  const value = requireString(body, field);
  if (!isValidTime(value)) throw new HttpError(400, `Field "${field}" harus berformat JJ:MM`);
  return value;
}

/** Harga sengaja TIDAK dibaca dari klien; total dihitung server dari harga lapangan. */
export function parseNewBooking(body: unknown): NewBooking {
  return {
    venue_id: requirePositiveInt(body, 'venue_id'),
    tanggal: parseDate(requireString(body, 'tanggal')),
    jam_mulai: requireTime(body, 'jam_mulai'),
    jam_selesai: requireTime(body, 'jam_selesai'),
  };
}
