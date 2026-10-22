'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiUser, getErrorMessage } from '@/lib/api';

type AuthState = {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (payload: { name: string; email: string; password: string; confirmPassword: string }) => Promise<ApiUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setSession: (token: string, user: ApiUser) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('wanderly_token') : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    try {
      const { data } = await api.get('/auth/me', { headers: { Authorization: `Bearer ${stored}` } });
      setUser(data.user);
    } catch {
      localStorage.removeItem('wanderly_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
    const onExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('wanderly:session-expired', onExpired);
    return () => window.removeEventListener('wanderly:session-expired', onExpired);
  }, [hydrate]);

  const setSession = useCallback((t: string, u: ApiUser) => {
    localStorage.setItem('wanderly_token', t);
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data.token, data.user);
    return data.user as ApiUser;
  }, [setSession]);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; confirmPassword: string }) => {
      const { data } = await api.post('/auth/register', payload);
      setSession(data.token, data.user);
      return data.user as ApiUser;
    },
    [setSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('wanderly_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error(getErrorMessage(err));
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser, setSession }),
    [user, token, loading, login, register, logout, refreshUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
