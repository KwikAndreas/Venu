import type { ErrorRequestHandler, RequestHandler } from 'express';
import { isBeforeMode } from '../config/env.ts';
import { HttpError } from '../lib/http-error.ts';

// Kode error PostgreSQL yang berasal dari data kiriman klien, bukan kegagalan server.
const PG_CLIENT_ERRORS: Record<string, number> = {
  '23505': 409, // unique_violation
  '23503': 409, // foreign_key_violation
  '23514': 400, // check_violation, mis. jam_tutup <= jam_buka
};

// Pesan aman per status untuk error yang tidak ditulis sendiri oleh aplikasi.
const SAFE_MESSAGES: Record<number, string> = {
  400: 'Data yang dikirim tidak valid',
  409: 'Data bentrok dengan data yang sudah ada',
  413: 'Data yang dikirim terlalu besar',
};
const SERVER_ERROR_MESSAGE = 'Terjadi kesalahan pada server. Silakan coba lagi.';

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

/** Pesan HttpError ditulis oleh aplikasi sendiri, jadi aman ditampilkan; lainnya diganti generik. */
function safeMessage(error: unknown, status: number): string {
  if (error instanceof HttpError) return error.message;
  if (status >= 500) return SERVER_ERROR_MESSAGE;
  return SAFE_MESSAGES[status] ?? 'Permintaan tidak dapat diproses';
}

export const notFoundHandler: RequestHandler = (req) => {
  throw new HttpError(404, `Endpoint ${req.method} ${req.path} tidak ditemukan`);
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  const status = getStatus(error);

  if (isBeforeMode) {
    // [VULN-A02] Pesan error asli dan stack trace dikirim ke klien, membocorkan
    // struktur folder, nama file, dan detail internal server.
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
    res.status(status).json({ message, stack: error instanceof Error ? error.stack : undefined });
    return;
  }

  // [FIXED-A02] Detail error hanya dicatat di log server; klien menerima pesan yang aman.
  if (status >= 500) console.error(`[ERROR] ${req.method} ${req.originalUrl}`, error);
  res.status(status).json({ message: safeMessage(error, status) });
};
