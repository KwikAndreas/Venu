import { HttpError } from './http-error.ts';

function readField(body: unknown, field: string): unknown {
  if (typeof body !== 'object' || body === null) return undefined;
  return (body as Record<string, unknown>)[field];
}

/** Mengambil field string wajib dari body request; 400 bila kosong atau bukan string. */
export function requireString(body: unknown, field: string): string {
  const value = readField(body, field);
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `Field "${field}" wajib diisi`);
  }
  return value.trim();
}

export function optionalString(body: unknown, field: string): string | undefined {
  const value = readField(body, field);
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}
