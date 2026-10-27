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

/** Bilangan bulat positif dari body (boleh dikirim sebagai angka atau string angka). */
export function optionalPositiveInt(body: unknown, field: string): number | undefined {
  const value = readField(body, field);
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new HttpError(400, `Field "${field}" harus bilangan bulat positif`);
  }
  return number;
}

export function requirePositiveInt(body: unknown, field: string): number {
  const value = optionalPositiveInt(body, field);
  if (value === undefined) throw new HttpError(400, `Field "${field}" wajib diisi`);
  return value;
}

export function optionalStringArray(body: unknown, field: string): string[] | undefined {
  const value = readField(body, field);
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new HttpError(400, `Field "${field}" harus berupa daftar teks`);
  }
  return value.map((item: string) => item.trim()).filter((item) => item !== '');
}

/** ID dari parameter URL (mis. /venues/:id). ID tidak valid dianggap tidak ditemukan. */
export function parseIdParam(value: unknown): number {
  const id = typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Data tidak ditemukan');
  return id;
}

/** Nilai tunggal dari query string (?key=value); array atau kosong dianggap tidak ada. */
export function queryValue(query: Record<string, unknown>, key: string): string | undefined {
  const value = query[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}
