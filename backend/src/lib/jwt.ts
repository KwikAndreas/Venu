import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { HttpError } from './http-error.ts';
import { isRole, type Role } from '../types/role.ts';

export type AuthUser = {
  id: number;
  role: Role;
};

export function signToken(user: AuthUser): string {
  // [VULN-A07] Token dibuat tanpa `expiresIn`: berlaku selamanya, termasuk setelah logout.
  return jwt.sign({ role: user.role }, env.jwtSecret, { subject: String(user.id) });
}

export function verifyToken(token: string): AuthUser {
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Token tidak valid');
  }

  if (typeof payload === 'string' || !payload.sub || !isRole(payload.role)) {
    throw new HttpError(401, 'Token tidak valid');
  }
  return { id: Number(payload.sub), role: payload.role };
}
