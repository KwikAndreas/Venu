import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../lib/http-error.ts';

function getStatus(error: unknown): number {
  if (error instanceof HttpError) return error.status;
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
