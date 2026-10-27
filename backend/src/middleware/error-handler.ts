import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../lib/http-error.ts';

// Kode error PostgreSQL yang berasal dari data kiriman klien, bukan kegagalan server.
const PG_CLIENT_ERRORS: Record<string, number> = {
  '23505': 409, // unique_violation
  '23503': 409, // foreign_key_violation
  '23514': 400, // check_violation, mis. jam_tutup <= jam_buka
};

function getStatus(error: unknown): number {
  if (error instanceof HttpError) return error.status;
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    const status = PG_CLIENT_ERRORS[error.code];
    if (status) return status;
  }
  // Error bawaan Express/body-parser (mis. JSON rusak) membawa properti `status`.
  if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
    return error.status;
  }
  return 500;
}

export const notFoundHandler: RequestHandler = (req) => {
  throw new HttpError(404, `Endpoint ${req.method} ${req.path} tidak ditemukan`);
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const status = getStatus(error);
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan';

  // [VULN-A02] Pesan error asli dan stack trace dikirim ke klien, membocorkan
  // struktur folder, nama file, dan detail internal server.
  res.status(status).json({ message, stack: error instanceof Error ? error.stack : undefined });
};
