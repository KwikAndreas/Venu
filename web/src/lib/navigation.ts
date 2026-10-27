/**
 * Hanya menerima path internal seperti "/riwayat". Menolak "https://...", "//situs-lain"
 * atau "/\situs-lain" agar parameter ?next= tidak bisa dipakai untuk open redirect.
 */
export function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return null;
  }
  return next;
}
