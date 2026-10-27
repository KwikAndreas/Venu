import { Router, type RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { isBeforeMode } from '../../config/env.ts';
import { HttpError } from '../../lib/http-error.ts';
import { revokeToken } from '../../lib/token-denylist.ts';
import { optionalString, requireString } from '../../lib/request.ts';
import { getAuthUser, requireAuth } from '../../middleware/auth.ts';
import type { Role } from '../../types/role.ts';
import { login, register } from './auth.service.ts';

const SELF_SERVICE_ROLES: readonly Role[] = ['penyewa', 'pemilik'];
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function tooManyAttempts(message: string): RequestHandler {
  return (_req, _res, next) => next(new HttpError(429, message));
}

// [FIXED-A07] Batas percobaan per IP (hanya dipasang di mode after).
const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooManyAttempts('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'),
});
const registerLimiter = rateLimit({
  windowMs: ONE_HOUR,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: tooManyAttempts('Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.'),
});

// [VULN-A07] Mode before: tanpa rate limit atau batas percobaan, login bisa di-brute force.
const loginGuards: RequestHandler[] = isBeforeMode ? [] : [loginLimiter];
const registerGuards: RequestHandler[] = isBeforeMode ? [] : [registerLimiter];

function parseRegisterRole(body: unknown): Role {
  const requested = optionalString(body, 'role') ?? 'penyewa';
  if (isBeforeMode) {
    // [VULN-A01] Peran diambil mentah dari klien tanpa allowlist, sehingga siapa pun
    // bisa mendaftar langsung sebagai "admin" (mass assignment / privilege escalation).
    return requested as Role;
  }
  // [FIXED-A01] Registrasi mandiri hanya boleh sebagai penyewa atau pemilik.
  if (!SELF_SERVICE_ROLES.includes(requested as Role)) {
    throw new HttpError(400, 'Peran harus "penyewa" atau "pemilik"');
  }
  return requested as Role;
}

export const authRouter = Router();

authRouter.post('/register', ...registerGuards, async (req, res) => {
  const user = await register(
    {
      nama: requireString(req.body, 'nama'),
      email: requireString(req.body, 'email').toLowerCase(),
      password: requireString(req.body, 'password'),
      role: parseRegisterRole(req.body),
    },
    req.ip ?? null,
  );
  res.status(201).json({ user });
});

authRouter.post('/login', ...loginGuards, async (req, res) => {
  const result = await login(
    requireString(req.body, 'email').toLowerCase(),
    requireString(req.body, 'password'),
    req.ip ?? null,
  );
  res.json(result);
});

authRouter.post('/logout', requireAuth, (req, res) => {
  if (isBeforeMode) {
    // [VULN-A07] Logout hanya formalitas: token tidak dicabut di server dan tetap
    // bisa dipakai selamanya oleh siapa pun yang memilikinya.
  } else {
    // [FIXED-A07] Token dicabut di server sampai masa berlakunya habis.
    const { tokenId, expiresAtMs } = getAuthUser(req);
    if (tokenId && expiresAtMs) revokeToken(tokenId, expiresAtMs);
  }
  res.json({ message: 'Logout berhasil' });
});
