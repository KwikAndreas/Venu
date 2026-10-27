import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export type SecurityMode = 'before' | 'after';

const MIN_JWT_SECRET_LENGTH = 32;
const LOCAL_ONLY_HOST = '127.0.0.1';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} belum diisi. Lihat backend/.env.example.`);
  }
  return value;
}

/** Mode keamanan. Kosong = "after" (aman), supaya lupa mengisi tidak membuka celah. */
function readSecurityMode(): SecurityMode {
  const value = (process.env.SECURITY_MODE ?? '').trim().toLowerCase() || 'after';
  if (value !== 'before' && value !== 'after') {
    throw new Error(`SECURITY_MODE harus "before" atau "after", bukan "${value}".`);
  }
  return value;
}

const securityMode = readSecurityMode();
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = requireEnv('JWT_SECRET');

// Pengaman mode before: versi rentan hanya boleh jalan di komputer lokal (TASK.md §7).
if (securityMode === 'before' && isProduction) {
  throw new Error(
    'SECURITY_MODE=before dilarang saat NODE_ENV=production. Versi Before hanya untuk pengujian lokal.',
  );
}
if (securityMode === 'after' && jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
  throw new Error(`JWT_SECRET minimal ${MIN_JWT_SECRET_LENGTH} karakter acak di mode after.`);
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret,
  securityMode,
  isProduction,
  /** Mode before selalu hanya mendengar di 127.0.0.1, apa pun isi HOST. */
  host: securityMode === 'before' ? LOCAL_ONLY_HOST : (process.env.HOST ?? LOCAL_ONLY_HOST),
  /** Origin web yang boleh memanggil API di mode after (pisahkan dengan koma). */
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Password akun seed di mode after; kosong = dibuat acak. */
  seedPassword: process.env.SEED_PASSWORD || undefined,
} as const;

/** true bila aplikasi berjalan sebagai versi Before (celah disengaja aktif). */
export const isBeforeMode = env.securityMode === 'before';
