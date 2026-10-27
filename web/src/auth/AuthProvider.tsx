import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized, tokenStorage } from '../lib/api.ts';
import type { User } from '../lib/types.ts';
import { AuthContext, type AuthContextValue, type RegisterInput } from './auth-context.ts';

type SessionState = { user: User | null; ready: boolean };

export function AuthProvider({ children }: { children: ReactNode }) {
  // Tanpa token tersimpan, tidak ada sesi yang perlu diperiksa.
  const [session, setSession] = useState<SessionState>(() => ({
    user: null,
    ready: tokenStorage.get() === null,
  }));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setSession({ user: null, ready: true });
  }, []);

  useEffect(() => {
    onUnauthorized(clearSession);
    if (tokenStorage.get() === null) return;
    api
      .get<{ user: User }>('/me')
      .then(({ user }) => setSession({ user, ready: true }), clearSession);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    tokenStorage.set(result.token);
    setSession({ user: result.user, ready: true });
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await api.post('/auth/register', input);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback((user: User) => {
    setSession((current) => ({ ...current, user }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, login, register, logout, updateUser }),
    [session, login, register, logout, updateUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
