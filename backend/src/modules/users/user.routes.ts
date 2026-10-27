import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { optionalString, requireString } from '../../lib/request.ts';
import { getAuthUser, requireAuth } from '../../middleware/auth.ts';
import { changePassword, getProfile, updateProfile } from './user.service.ts';

export const userRouter = Router();

userRouter.get('/me', requireAuth, async (req, res) => {
  res.json({ user: await getProfile(getAuthUser(req).id) });
});

// Edit profil: body { nama?, email? }
userRouter.patch('/me', requireAuth, async (req, res) => {
  const nama = optionalString(req.body, 'nama');
  const email = optionalString(req.body, 'email')?.toLowerCase();
  if (!nama && !email) throw new HttpError(400, 'Tidak ada field yang diubah');

  const user = await updateProfile(getAuthUser(req).id, { nama, email }, req.ip ?? null);
  res.json({ user });
});

// Ganti password: body { password_lama, password_baru }
userRouter.put('/me/password', requireAuth, async (req, res) => {
  await changePassword(
    getAuthUser(req).id,
    {
      lama: requireString(req.body, 'password_lama'),
      baru: requireString(req.body, 'password_baru'),
    },
    req.ip ?? null,
  );
  res.json({ message: 'Password berhasil diganti' });
});
