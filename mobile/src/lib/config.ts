import Constants from 'expo-constants';

const API_PORT = 4000;

/**
 * Saat dijalankan lewat Expo Go, `hostUri` berisi alamat laptop yang menjalankan Metro
 * (mis. "192.168.1.5:8081"). Backend diasumsikan berjalan di laptop yang sama.
 */
function apiFromDevServer(): string | undefined {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${API_PORT}` : undefined;
}

/**
 * Alamat backend. Urutan: EXPO_PUBLIC_API_URL di mobile/.env → alamat laptop dari Expo Go →
 * localhost. Lihat README bagian Mobile untuk pilihan emulator/HP.
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  apiFromDevServer() ||
  `http://localhost:${API_PORT}`
).replace(/\/+$/, '');

/** Samakan dengan SECURITY_MODE backend. Kosong atau nilai lain = "after". */
export const IS_BEFORE_MODE = process.env.EXPO_PUBLIC_SECURITY_MODE === 'before';

/** Foto lokal dari backend ("/uploads/...") diubah menjadi URL lengkap. */
export function assetUrl(path: string): string {
  return path.startsWith('/') ? `${API_URL}${path}` : path;
}
