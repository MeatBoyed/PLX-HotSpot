import type { AuthProfile } from '@/lib/types';
import { setToken, platformRequest } from './client';

export { setToken };

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

export interface PatchMeBody {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

export interface MeResponse {
  profileId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  balance: string;
  status: string;
}

export const platformAuthApi = {
  me: () =>
    platformRequest<AuthTokenResponse>('/auth/me'),

  patchMe: (body: PatchMeBody) =>
    platformRequest<MeResponse>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),

  login: (body: LoginBody) =>
    platformRequest<AuthTokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  register: (body: RegisterBody) =>
    platformRequest<AuthTokenResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Best-effort — fire and forget, never block the client-side logout flow
  logout: () =>
    platformRequest<void>('/auth/logout', { method: 'POST' }).catch(() => undefined),
};
