import type { AuthProfile } from '@/lib/types';

export interface LoginBody {
  email: string;
  password: string;
  rememberMe?: boolean;
  tenantId?: string | null;
  ssid?: string | null;
}

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  tenantId?: string | null;
  ssid?: string | null;
}

// Flat response shape returned by /auth/login, /auth/register, and /auth/me
export type AuthTokenResponse = AuthProfile & {
  token: string;
  expiresAt: string;
};

let _token: string | null = null;

export function setToken(t: string | null): void {
  _token = t;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status });
  }
  return res.json() as Promise<T>;
}

export const platformAuthApi = {
  me: () =>
    request<AuthTokenResponse>('/auth/me'),

  login: (body: LoginBody) =>
    request<AuthTokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  register: (body: RegisterBody) =>
    request<AuthTokenResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  logout: (): Promise<{ message: string }> =>
    Promise.resolve({ message: 'ok' }),
};
