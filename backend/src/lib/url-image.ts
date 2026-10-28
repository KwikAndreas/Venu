import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { isBeforeMode } from '../config/env.ts';
import { HttpError } from './http-error.ts';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const FETCH_TIMEOUT_MS = 5000;

/** Mengambil isi sebuah URL sampai batas ukuran, dengan timeout. */
async function download(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new HttpError(400, `Gagal mengambil gambar (HTTP ${response.status})`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new HttpError(413, 'Ukuran gambar maksimal 2 MB');
    return bytes;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'URL gambar tidak bisa diakses');
  } finally {
    clearTimeout(timer);
  }
}

/** true untuk alamat loopback/privat/link-local/metadata yang tidak boleh dijangkau dari server. */
function isPrivateAddress(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.')) return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // link-local, termasuk 169.254.169.254 (metadata cloud)
  const second = Number(ip.split('.')[1]);
  if (ip.startsWith('172.') && second >= 16 && second <= 31) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true; // IPv6 ULA/link-local
  return false;
}

/**
 * Memvalidasi tujuan URL sebelum di-fetch (khusus mode after).
 * Menolak skema selain http/https dan host yang mengarah ke jaringan internal.
 */
async function assertSafeDestination(target: URL): Promise<void> {
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    throw new HttpError(400, 'URL harus diawali http:// atau https://');
  }
  const host = target.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new HttpError(400, 'Tujuan URL tidak diizinkan');
  }
  // Resolusi DNS lalu tolak bila IP tujuan berada di jaringan internal (anti-SSRF).
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new HttpError(400, 'Tujuan URL tidak diizinkan');
  }
}

/**
 * Mengunduh gambar dari URL yang diberikan klien.
 * [VULN-A01] Mode before: URL apa pun di-fetch tanpa batasan, sehingga server bisa dipaksa
 * mengakses jaringan internal (SSRF), mis. http://127.0.0.1:4000, http://169.254.169.254/
 * (metadata cloud), atau host lain di balik firewall — respons/perilakunya bocor lewat fitur ini.
 * [FIXED-A01] Mode after: hanya http/https ke host publik; loopback, IP privat, link-local, dan
 * metadata ditolak sebelum request dikirim.
 */
export async function fetchImageFromUrl(rawUrl: string): Promise<Buffer> {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    throw new HttpError(400, 'URL tidak valid');
  }

  if (!isBeforeMode) await assertSafeDestination(target);
  return download(target.toString());
}
