import type { AuthUser } from '../lib/jwt.ts';

declare global {
  namespace Express {
    interface Request {
      /** Diisi oleh middleware requireAuth setelah token terverifikasi. */
      user?: AuthUser;
    }
  }
}

export {};
