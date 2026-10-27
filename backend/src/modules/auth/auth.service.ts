import { HttpError } from '../../lib/http-error.ts';
import { signToken } from '../../lib/jwt.ts';
import { hashPassword, verifyPassword } from '../../lib/password.ts';
import type { Role } from '../../types/role.ts';
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

export async function register(input: RegisterInput): Promise<PublicUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new HttpError(409, 'Email sudah terdaftar');

  // [VULN-A07] Tidak ada kebijakan password: "1", "123", atau "password" diterima.
  return insertUser({
    nama: input.nama,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
  });
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await findUserByEmail(email);

  // [VULN-A07] Pesan error berbeda untuk email tidak terdaftar vs password salah,
  // sehingga penyerang bisa menebak email mana yang terdaftar (user enumeration).
  if (!user) throw new HttpError(404, 'Email tidak terdaftar');
  if (!verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'Password salah');
  }

  const { password_hash: _omit, ...publicUser } = user;
  return { token: signToken({ id: user.id, role: user.role }), user: publicUser };
}
