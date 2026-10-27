import { createContext, useContext } from 'react';
import type { Role, User } from '../lib/types.ts';

export type RegisterInput = {
  nama: string;
  email: string;
  password: string;
  role: Extract<Role, 'penyewa' | 'pemilik'>;
};

export type AuthContextValue = {
  user: User | null;
  /** false selama sesi tersimpan sedang diperiksa ke server. */
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return value;
}

/** Halaman awal setelah login, sesuai peran. */
export function homePathFor(role: Role): string {
  if (role === 'pemilik') return '/pemilik';
  if (role === 'admin') return '/admin';
  return '/';
}
