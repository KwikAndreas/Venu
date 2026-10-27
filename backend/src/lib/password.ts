import { createHash } from 'node:crypto';

// [VULN-A04] Password di-hash dengan MD5 tanpa salt: sangat cepat dan mudah dipecahkan
// dengan rainbow table (mis. CrackStation). Password yang sama menghasilkan hash yang sama.
export function hashPassword(password: string): string {
  return createHash('md5').update(password).digest('hex');
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}
