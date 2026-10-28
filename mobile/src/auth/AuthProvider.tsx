import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized, tokenStore } from '@/lib/api';
import type { User } from '@/lib/types';
import { AuthContext, type AuthContextValue, type RegisterInput } from './auth-context';

type SessionState = { user: User | null; ready: boolean };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ user: null, ready: false });

  const clearSession = useCallback(() => {
    tokenStore.clear().catch(() => undefined);
    setSession({ user: null, ready: true });
  }, []);

  useEffect(() => {
    onUnauthorized(clearSession);
    tokenStore.load().then((token) => {
      if (!token) {
        setSession({ user: null, ready: true });
        return;
      }
      api
        .get<{ user: User }>('/me')
        .then(({ user }) => setSession({ user, ready: true }), clearSession);
    }, clearSession);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    await tokenStore.save(result.token);
    setSession({ user: result.user, ready: true });
    return result.user;
  }, []);

  /** Aplikasi mobile ditujukan untuk penyewa, jadi pendaftaran selalu sebagai penyewa. */
  const register = useCallback(
    async (input: RegisterInput) => {
      await api.post('/auth/register', { ...input, role: 'penyewa' });
      return login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
