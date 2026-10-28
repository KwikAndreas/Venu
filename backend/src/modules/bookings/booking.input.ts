import { isBeforeMode } from '../../config/env.ts';
import { HttpError } from '../../lib/http-error.ts';
import { optionalPositiveInt, requirePositiveInt, requireString } from '../../lib/request.ts';
import { isValidDate, isValidTime } from '../../lib/time.ts';

export type NewBooking = {
  venue_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  /** Hanya dipakai di mode before; di mode after selalu diabaikan. */
  total_harga?: number;
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

export function parseNewBooking(body: unknown): NewBooking {
  return {
    venue_id: requirePositiveInt(body, 'venue_id'),
    tanggal: parseDate(requireString(body, 'tanggal')),
    jam_mulai: requireTime(body, 'jam_mulai'),
    jam_selesai: requireTime(body, 'jam_selesai'),
    // [VULN-A06] Mode before: harga total dibaca dari klien dan nanti dipercaya apa adanya.
    // [FIXED-A06] Mode after: field ini diabaikan; total selalu dihitung server dari harga lapangan.
    total_harga: isBeforeMode ? optionalPositiveInt(body, 'total_harga') : undefined,
  };
}
