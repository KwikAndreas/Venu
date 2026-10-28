import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isBeforeMode } from '../config/env.ts';
import { HttpError } from './http-error.ts';
import { detectFileType, type FileExtension } from './file-type.ts';

export type UploadFolder = 'venues' | 'payments';

/** Folder `backend/uploads` (di luar `src`, diabaikan Git). */
export const UPLOAD_ROOT = fileURLToPath(new URL('../../uploads/', import.meta.url));

export type SavedUpload = {
  key: string;
  extension: string;
};

/**
 * [VULN-A08] Mode before: jenis file TIDAK diverifikasi dari isinya dan NAMA FILE ASLI dari
 * klien dipakai apa adanya. Penyewa/pemilik bisa mengunggah mis. `evil.svg`/`evil.html` berisi
 * <script>; file itu tersimpan dengan nama & ekstensi aslinya dan disajikan dari /uploads/venues,
 * sehingga dieksekusi di origin situs (stored XSS lewat upload).
 */
async function saveUploadBefore(
  folder: UploadFolder,
  bytes: Buffer,
  originalName?: string,
): Promise<SavedUpload> {
  // basename agar tetap di dalam folder upload, tetapi nama & ekstensi dari klien dipertahankan.
  const name = basename(originalName?.trim() || `${randomUUID()}.bin`);
  const extension = name.includes('.') ? (name.split('.').pop() ?? 'bin') : 'bin';
  const key = `${folder}/${name}`;
  await mkdir(join(UPLOAD_ROOT, folder), { recursive: true });
  await writeFile(join(UPLOAD_ROOT, key), bytes);
  return { key, extension };
}

/**
 * Menyimpan file upload.
 * [FIXED-A08] Mode after: jenis diperiksa dari isi file (magic bytes), hanya tipe yang diizinkan
 * diterima, dan nama file selalu diganti UUID acak buatan server (nama klien diabaikan).
 */
export async function saveUpload(
  folder: UploadFolder,
  bytes: Buffer,
  allowed: readonly FileExtension[],
  originalName?: string,
): Promise<SavedUpload> {
  if (isBeforeMode) return saveUploadBefore(folder, bytes, originalName);

  const extension = detectFileType(bytes);
  if (!extension || !allowed.includes(extension)) {
    throw new HttpError(400, `Jenis file tidak didukung. Gunakan: ${allowed.join(', ')}`);
  }

  const key = `${folder}/${randomUUID()}.${extension}`;
  await mkdir(join(UPLOAD_ROOT, folder), { recursive: true });
  await writeFile(join(UPLOAD_ROOT, key), bytes, { flag: 'wx' });
  return { key, extension };
}

/**
 * Path absolut file upload. Memastikan hasilnya tetap di dalam folder upload (mencegah path
 * traversal keluar direktori), apa pun nama file yang tersimpan.
 */
export function resolveUpload(key: string): string {
  const full = join(UPLOAD_ROOT, key);
  const root = join(UPLOAD_ROOT);
  if (!full.startsWith(root)) throw new Error(`Kunci upload tidak valid: ${key}`);
  return full;
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
