import { describe, it, expect } from 'vitest';
import { AuthService, type AuthMode } from './auth-service';

const svc = new AuthService();

describe('AuthService.buildCredentials — free flow', () => {
  it('returns free credentials when free auth is enabled and nothing else supplied', () => {
    const res = svc.buildCredentials({ enabledAuth: ['free'] });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.credentials.mode).toBe('free');
      expect(res.credentials.username).toBeTruthy();
      expect(res.credentials.password).toBeTruthy();
    }
  });

  it('rejects when free auth is not enabled', () => {
    const res = svc.buildCredentials({ enabledAuth: [] });
    expect(res).toEqual({ ok: false, error: 'Free authentication not enabled' });
  });

  it('treats an empty-string voucher as no voucher and falls through to free', () => {
    const res = svc.buildCredentials({ voucherCode: '', enabledAuth: ['free'] });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.credentials.mode).toBe('free');
  });
});

describe('AuthService.buildCredentials — voucher flow', () => {
  it('uses the trimmed voucher code as both username and password', () => {
    const res = svc.buildCredentials({ voucherCode: '  ABC123  ', enabledAuth: ['voucher'] });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.credentials).toEqual({
        username: 'ABC123',
        password: 'ABC123',
        mode: 'voucher',
        voucherCode: 'ABC123',
      });
    }
  });

  it('rejects a voucher when voucher auth is not enabled', () => {
    const res = svc.buildCredentials({ voucherCode: 'ABC123', enabledAuth: ['free'] });
    expect(res).toEqual({ ok: false, error: 'Voucher authentication not enabled' });
  });
});

describe('AuthService.buildCredentials — permanent-user flow', () => {
  const puModes: AuthMode[] = ['pu-login', 'pu-phonename'];

  for (const mode of puModes) {
    it(`returns trimmed credentials for ${mode} when enabled`, () => {
      const res = svc.buildCredentials({
        username: '  alice  ',
        password: '  secret  ',
        mode,
        enabledAuth: [mode],
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.credentials).toEqual({ username: 'alice', password: 'secret', mode });
      }
    });
  }

  it('rejects when the permanent-user mode is not enabled', () => {
    const res = svc.buildCredentials({
      username: 'alice',
      password: 'secret',
      mode: 'pu-login',
      enabledAuth: ['free'],
    });
    expect(res).toEqual({ ok: false, error: "Authentication mode 'pu-login' not enabled" });
  });

  it('rejects when username or password is blank after trim', () => {
    const res = svc.buildCredentials({
      username: '   ',
      password: 'secret',
      mode: 'pu-login',
      enabledAuth: ['pu-login'],
    });
    expect(res).toEqual({ ok: false, error: 'Username and Password required' });
  });

  it('falls through to free when username/password are given but mode is unspecified', () => {
    const res = svc.buildCredentials({
      username: 'alice',
      password: 'secret',
      enabledAuth: ['free'],
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.credentials.mode).toBe('free');
  });
});
