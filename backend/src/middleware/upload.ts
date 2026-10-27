import type { RequestHandler } from 'express';
import multer from 'multer';
import { HttpError } from '../lib/http-error.ts';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Menerima tepat satu file di field `field` (multipart/form-data) dan menyimpannya di memori
 * sebagai `req.file`. Jenis file diverifikasi belakangan oleh `saveUpload` dari isinya.
 */
export function uploadSingleFile(field: string): RequestHandler {
  const handler = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1, fields: 10 },
  }).single(field);

  return (req, res, next) => {
    handler(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        const message =
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Ukuran file maksimal 2 MB'
            : `Upload tidak valid: kirim satu file di field "${field}"`;
        next(new HttpError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, message));
        return;
      }
      next(error);
    });
  };
}

/** Mengambil file hasil upload; 400 bila klien tidak mengirim file. */
export function requireUploadedFile(file: Express.Multer.File | undefined, field: string): Buffer {
  if (!file || file.size === 0) throw new HttpError(400, `File "${field}" wajib diunggah`);
  return file.buffer;
}
