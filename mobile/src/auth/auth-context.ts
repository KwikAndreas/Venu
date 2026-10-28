import { createContext, use } from 'react';
import type { User } from '@/lib/types';

export type RegisterInput = { nama: string; email: string; password: string };

export type AuthContextValue = {
  user: User | null;
  /** false selama token tersimpan masih diperiksa ke server. */
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return value;
}
