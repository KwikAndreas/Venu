import { HttpError } from '../../lib/http-error.ts';
import { signToken } from '../../lib/jwt.ts';
import { hashPassword, verifyPassword } from '../../lib/password.ts';
import type { Role } from '../../types/role.ts';
import { recordAudit, recordFailedLogin } from '../audit/audit.service.ts';
import { findUserByEmail, insertUser, type PublicUser } from '../users/user.repository.ts';

export type RegisterInput = {
  nama: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginResult = {
  token: string;
  user: PublicUser;
};

export async function register(input: RegisterInput, ip: string | null): Promise<PublicUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new HttpError(409, 'Email sudah terdaftar');

  // [VULN-A07] Tidak ada kebijakan password: "1", "123", atau "password" diterima.
  const user = await insertUser({
    nama: input.nama,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
  });
  await recordAudit({
    userId: user.id,
    aksi: 'auth.register',
    detail: { email: user.email, role: user.role },
    ip,
  });
  return user;
}

export async function login(
  email: string,
  password: string,
  ip: string | null,
): Promise<LoginResult> {
  const user = await findUserByEmail(email);
  const passwordValid = user !== undefined && verifyPassword(password, user.password_hash);

  if (!user || !passwordValid) {
    await recordFailedLogin({ email, userId: user?.id ?? null, ip });
    // [VULN-A07] Pesan error berbeda untuk email tidak terdaftar vs password salah,
    // sehingga penyerang bisa menebak email mana yang terdaftar (user enumeration).
    if (!user) throw new HttpError(404, 'Email tidak terdaftar');
    throw new HttpError(401, 'Password salah');
  }

  // Email ikut disimpan agar log tetap bermakna walau user kelak dihapus (user_id menjadi NULL).
  await recordAudit({ userId: user.id, aksi: 'auth.login_berhasil', detail: { email }, ip });
  const { password_hash: _omit, ...publicUser } = user;
  return { token: signToken({ id: user.id, role: user.role }), user: publicUser };
}
