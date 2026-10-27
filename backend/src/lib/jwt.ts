import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env, isBeforeMode } from '../config/env.ts';
import { HttpError } from './http-error.ts';
import { isTokenRevoked } from './token-denylist.ts';
import { isRole, type Role } from '../types/role.ts';

const TOKEN_TTL = '2h';
const ALGORITHM = 'HS256';

export type AuthUser = {
  id: number;
  role: Role;
  /** ID unik token (jti) dan waktu kedaluwarsa (ms); hanya ada di mode after. */
  tokenId?: string;
  expiresAtMs?: number;
};

export function signToken(user: Pick<AuthUser, 'id' | 'role'>): string {
  const claims = { role: user.role };
  if (isBeforeMode) {
    // [VULN-A07] Token dibuat tanpa `expiresIn`: berlaku selamanya, termasuk setelah logout.
    return jwt.sign(claims, env.jwtSecret, { subject: String(user.id) });
  }
  // [FIXED-A07] Token berlaku 2 jam dan punya ID unik (jti) agar bisa dicabut saat logout.
  return jwt.sign(claims, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: TOKEN_TTL,
    jwtid: randomUUID(),
    algorithm: ALGORITHM,
  });
}

export function verifyToken(token: string): AuthUser {
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] });
  } catch {
    throw new HttpError(401, 'Token tidak valid');
  }

  if (typeof payload === 'string' || !payload.sub || !isRole(payload.role)) {
    throw new HttpError(401, 'Token tidak valid');
  }
  if (!isBeforeMode) {
    // [FIXED-A07] Token mode after wajib punya masa berlaku & ID, dan belum dicabut.
    if (!payload.jti || !payload.exp || isTokenRevoked(payload.jti)) {
      throw new HttpError(401, 'Sesi berakhir, silakan login ulang');
    }
  }
  return {
    id: Number(payload.sub),
    role: payload.role,
    tokenId: payload.jti,
    expiresAtMs: payload.exp ? payload.exp * 1000 : undefined,
  };
}
