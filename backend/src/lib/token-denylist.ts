/**
 * Daftar token yang sudah dicabut (logout), disimpan di memori sampai token kedaluwarsa.
 * Cukup untuk satu instance server; isinya hilang bila server restart, tetapi token
 * mode after hanya berlaku 2 jam sehingga jendela risikonya terbatas.
 */
const revokedUntil = new Map<string, number>();

function pruneExpired(now: number): void {
  for (const [tokenId, expiresAt] of revokedUntil) {
    if (expiresAt <= now) revokedUntil.delete(tokenId);
  }
}

export function revokeToken(tokenId: string, expiresAtMs: number): void {
  const now = Date.now();
  pruneExpired(now);
  if (expiresAtMs > now) revokedUntil.set(tokenId, expiresAtMs);
}

export function isTokenRevoked(tokenId: string): boolean {
  const expiresAt = revokedUntil.get(tokenId);
  return expiresAt !== undefined && expiresAt > Date.now();
}
