import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { getAuthUser, requireAuth } from '../../middleware/auth.ts';
import { findUserById } from './user.repository.ts';

export const userRouter = Router();

userRouter.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(getAuthUser(req).id);
  if (!user) throw new HttpError(404, 'User tidak ditemukan');
  res.json({ user });
});
