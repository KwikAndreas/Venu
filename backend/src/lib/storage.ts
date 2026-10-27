import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from './http-error.ts';
import { detectFileType, type FileExtension } from './file-type.ts';

export type UploadFolder = 'venues' | 'payments';

/** Folder `backend/uploads` (di luar `src`, diabaikan Git). */
export const UPLOAD_ROOT = fileURLToPath(new URL('../../uploads/', import.meta.url));

// Kunci file selalu berbentuk "<folder>/<uuid>.<ext>" buatan server.
const UPLOAD_KEY_PATTERN = /^(venues|payments)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

export type SavedUpload = {
  key: string;
  extension: FileExtension;
};

/**
 * Memverifikasi isi file terhadap jenis yang diizinkan, lalu menyimpannya dengan nama acak.
 * Nama file asli dari klien tidak pernah dipakai.
 */
export async function saveUpload(
  folder: UploadFolder,
  bytes: Buffer,
  allowed: readonly FileExtension[],
): Promise<SavedUpload> {
  const extension = detectFileType(bytes);
  if (!extension || !allowed.includes(extension)) {
    throw new HttpError(400, `Jenis file tidak didukung. Gunakan: ${allowed.join(', ')}`);
  }

  const key = `${folder}/${randomUUID()}.${extension}`;
  await mkdir(join(UPLOAD_ROOT, folder), { recursive: true });
  await writeFile(join(UPLOAD_ROOT, key), bytes, { flag: 'wx' });
  return { key, extension };
}

/** Path absolut file upload. Menolak kunci yang bukan buatan server (mencegah path traversal). */
export function resolveUpload(key: string): string {
  if (!UPLOAD_KEY_PATTERN.test(key)) throw new Error(`Kunci upload tidak valid: ${key}`);
  return join(UPLOAD_ROOT, key);
}

export async function removeUpload(key: string): Promise<void> {
  await rm(resolveUpload(key), { force: true });
}

/** Menghapus beberapa file setelah datanya dihapus; kegagalan hanya dicatat di console. */
export async function removeUploadsQuietly(keys: string[]): Promise<void> {
  for (const key of keys) {
    await removeUpload(key).catch((error: unknown) => {
      console.error(`Gagal menghapus file upload ${key}:`, error);
    });
  }
}
