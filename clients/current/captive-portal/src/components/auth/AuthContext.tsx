'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { platformAuthApi, setToken, type LoginBody, type RegisterBody, type AuthTokenResponse, type PatchMeBody } from '@/infrastructure/api/platform/auth.api';
import type { AuthProfile } from '@/lib/types';

interface AuthContextValue {
  user: AuthProfile | null;
  loading: boolean;
  error: string | null;
  login: (body: LoginBody) => Promise<AuthProfile>;
  register: (body: RegisterBody) => Promise<AuthProfile>;
  logout: () => Promise<void>;
  updateProfile: (body: PatchMeBody) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
  ssid?: string;
  tenantId?: string;
}

const TOKEN_KEY = 'auth_token';

function readStoredToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

// API returns a flat object: token + profile fields together
function extractFromResponse(resp: AuthTokenResponse): { token: string; profile: AuthProfile } {
  const { token, expiresAt: _discard, ...profile } = resp;
  return { token, profile };
}

export function AuthProvider({ children, ssid, tenantId }: AuthProviderProps) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredToken();
    setToken(stored);

    if (!stored) {
      setLoading(false);
      return;
    }

    platformAuthApi.me()
      .then(resp => {
        const { token, profile } = extractFromResponse(resp);
        // /auth/me issues a fresh token — keep sessionStorage current
        try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
        setToken(token);
        setUser(profile);
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (body: LoginBody): Promise<AuthProfile> => {
    setError(null);
    const resp = await platformAuthApi.login({ ...body, ssid: ssid ?? null, tenantId: tenantId ?? null });
    const { token, profile } = extractFromResponse(resp);
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
    setToken(token);
    setUser(profile);
    return profile;
  };

  const register = async (body: RegisterBody): Promise<AuthProfile> => {
    setError(null);
    const resp = await platformAuthApi.register({ ...body, ssid: ssid ?? null, tenantId: tenantId ?? null });
    const { token, profile } = extractFromResponse(resp);
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
    setToken(token);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    setError(null);
    // Fire-and-forget — invalidate server session, don't block client teardown
    platformAuthApi.logout();
    try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (body: PatchMeBody): Promise<void> => {
    const resp = await platformAuthApi.patchMe(body);
    setUser(prev => prev ? {
      ...prev,
      firstName: resp.firstName,
      lastName: resp.lastName,
      displayName: resp.displayName,
      email: resp.email,
      phoneNumber: resp.phoneNumber,
    } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
