import { HttpError } from '../../lib/http-error.ts';
import { hashPassword, verifyPassword } from '../../lib/password.ts';
import { recordAudit } from '../audit/audit.service.ts';
import {
  findUserByEmail,
  findUserById,
  findUserWithPasswordById,
  updateUserPassword,
  updateUserProfile,
  type ProfileChanges,
  type PublicUser,
} from './user.repository.ts';

export async function getProfile(userId: number): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) throw new HttpError(404, 'User tidak ditemukan');
  return user;
}

export async function updateProfile(
  userId: number,
  changes: ProfileChanges,
  ip: string | null,
): Promise<PublicUser> {
  if (changes.email) {
    const owner = await findUserByEmail(changes.email);
    if (owner && owner.id !== userId) throw new HttpError(409, 'Email sudah dipakai akun lain');
  }

  const user = await updateUserProfile(userId, changes);
  if (!user) throw new HttpError(404, 'User tidak ditemukan');
  await recordAudit({
    userId,
    aksi: 'user.ubah_profil',
    detail: { field: Object.keys(changes) },
    ip,
  });
  return user;
}

/** Ganti password wajib menyertakan password lama, agar token curian saja tidak cukup. */
export async function changePassword(
  userId: number,
  passwords: { lama: string; baru: string },
  ip: string | null,
): Promise<void> {
  const user = await findUserWithPasswordById(userId);
  if (!user) throw new HttpError(404, 'User tidak ditemukan');
  if (!verifyPassword(passwords.lama, user.password_hash)) {
    throw new HttpError(400, 'Password lama tidak sesuai');
  }

  // Kebijakan password mengikuti register (lihat [VULN-A07] di auth.service.ts).
  await updateUserPassword(userId, hashPassword(passwords.baru));
  await recordAudit({ userId, aksi: 'user.ubah_password', ip });
}
