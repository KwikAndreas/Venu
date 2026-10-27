import { Router } from 'express';
import { optionalString, requireString } from '../../lib/request.ts';
import { requireAuth } from '../../middleware/auth.ts';
import type { Role } from '../../types/role.ts';
import { login, register } from './auth.service.ts';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const user = await register(
    {
      nama: requireString(req.body, 'nama'),
      email: requireString(req.body, 'email').toLowerCase(),
      password: requireString(req.body, 'password'),
      // [VULN-A01] Peran diambil mentah dari klien tanpa allowlist, sehingga siapa pun
      // bisa mendaftar langsung sebagai "admin" (mass assignment / privilege escalation).
      role: (optionalString(req.body, 'role') ?? 'penyewa') as Role,
    },
    req.ip ?? null,
  );
  res.status(201).json({ user });
});

// [VULN-A07] Tanpa rate limit atau batas percobaan: login bisa di-brute force tanpa batas.
authRouter.post('/login', async (req, res) => {
  const result = await login(
    requireString(req.body, 'email').toLowerCase(),
    requireString(req.body, 'password'),
    req.ip ?? null,
  );
  res.json(result);
});

authRouter.post('/logout', requireAuth, (_req, res) => {
  // [VULN-A07] Logout hanya formalitas: token tidak dicabut di server dan tetap
  // bisa dipakai selamanya oleh siapa pun yang memilikinya.
  res.json({ message: 'Logout berhasil' });
});
