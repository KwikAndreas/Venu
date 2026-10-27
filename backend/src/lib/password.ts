import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { isBeforeMode } from '../config/env.ts';
import { HttpError } from './http-error.ts';

const BCRYPT_COST = 12;
const BCRYPT_MAX_BYTES = 72;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;

function md5(password: string): string {
  return createHash('md5').update(password).digest('hex');
}

function isBcryptHash(passwordHash: string): boolean {
  return BCRYPT_PATTERN.test(passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
  if (isBeforeMode) {
    // [VULN-A04] Password di-hash dengan MD5 tanpa salt: sangat cepat dan mudah dipecahkan
    // dengan rainbow table (mis. CrackStation). Password yang sama menghasilkan hash yang sama.
    return md5(password);
  }
  // [FIXED-A04] bcrypt dengan salt acak per password dan cost 12 (lambat untuk brute force).
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Mengenali hash bcrypt maupun MD5 lama, agar satu database tetap bisa dipakai
 * saat SECURITY_MODE dipindah antara before dan after.
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (isBcryptHash(passwordHash)) return bcrypt.compare(password, passwordHash);
  return md5(password) === passwordHash;
}

/** Di mode after, hash lama (MD5) perlu diganti bcrypt setelah login berhasil. */
export function needsRehash(passwordHash: string): boolean {
  return !isBeforeMode && !isBcryptHash(passwordHash);
}

let dummyHash: Promise<string> | undefined;

/**
 * Menyamakan waktu respons login saat email tidak terdaftar, supaya penyerang tidak bisa
 * menebak email terdaftar dari lamanya respons.
 */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= bcrypt.hash('venu-dummy-password', BCRYPT_COST);
  await bcrypt.compare(password, await dummyHash);
  return false;
}

type PasswordRule = {
  violated: (password: string, emailName: string) => boolean;
  message: string;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    violated: (password) => password.length < MIN_PASSWORD_LENGTH,
    message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
  },
  {
    // bcrypt hanya memakai 72 byte pertama; sisanya akan diabaikan diam-diam.
    violated: (password) => Buffer.byteLength(password) > BCRYPT_MAX_BYTES,
    message: 'Password terlalu panjang',
  },
  {
    violated: (password) => !/[a-zA-Z]/.test(password) || !/\d/.test(password),
    message: 'Password harus berisi huruf dan angka',
  },
  {
    violated: (password, emailName) =>
      emailName.length >= 3 && password.toLowerCase().includes(emailName),
    message: 'Password tidak boleh mengandung nama email',
  },
];

/** Kebijakan password minimum untuk mode after (perbaikan A07). */
export function assertStrongPassword(password: string, email: string): void {
  const emailName = email.split('@')[0]?.toLowerCase() ?? '';
  const broken = PASSWORD_RULES.find((rule) => rule.violated(password, emailName));
  if (broken) throw new HttpError(400, broken.message);
}
