import type { RequestHandler } from 'express';
import { HttpError } from '../lib/http-error.ts';
import { verifyToken } from '../lib/jwt.ts';
import type { Role } from '../types/role.ts';

const BEARER_PREFIX = 'Bearer ';

/** Wajib login: membaca header `Authorization: Bearer <token>` dan mengisi `req.user`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new HttpError(401, 'Silakan login terlebih dahulu');
  }
  req.user = verifyToken(header.slice(BEARER_PREFIX.length));
  next();
};

/** Wajib peran tertentu. Pasang setelah `requireAuth`. */
export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      throw new HttpError(403, 'Anda tidak punya akses ke fitur ini');
    }
    next();
  };
}

/** Mengambil user login dari request; dipakai di handler setelah `requireAuth`. */
export function getAuthUser(req: Express.Request): NonNullable<Express.Request['user']> {
  if (!req.user) throw new HttpError(401, 'Silakan login terlebih dahulu');
  return req.user;
}
