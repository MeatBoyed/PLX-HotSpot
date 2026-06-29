import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Package } from '@/lib/services/package-service';

vi.mock('@/env', () => ({
  env: {
    MIKROTIK_RADIUS_DESK_BASE_URL: 'https://rd.test',
    RADIUSDESK_TOKEN: 'tok',
    RADIUSDESK_REALM_ID: 'realm-1',
    RADIUSDESK_PROFILE_ID: 'profile-1',
    RADIUSDESK_CLOUD_ID: 'cloud-1',
  },
}));

import { permanentUserService } from './permanent-user-service';

function makePackage(overrides: Partial<Package> = {}): Package {
  return {
    id: 1,
    ssid: 'PluxNet',
    name: 'PU Bundle',
    price: 0,
    radiusProfileId: 1,
    radiusProfile: 'default',
    ...overrides,
  };
}

function fetchResponse(body: string, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: async () => body,
  } as unknown as Response;
}

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, 'fetch');
});
afterEach(() => {
  vi.restoreAllMocks();
});

const baseInput = () => ({ username: 'alice', password: 'secret', pkg: makePackage() });

describe('PermanentUserService.createPermanentUser', () => {
  it('sends the required RadiusDesk payload from env config', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse(JSON.stringify({ success: true, data: {} })));
    await permanentUserService.createPermanentUser(baseInput());

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://rd.test/cake4/rd_cake/permanent-users/add.json');
    const payload = JSON.parse((opts as RequestInit).body as string);
    expect(payload).toMatchObject({
      user_id: 0,
      username: 'alice',
      password: 'secret',
      realm_id: 'realm-1',
      profile_id: 'profile-1',
      cloud_id: 'cloud-1',
      token: 'tok',
      active: 'true',
    });
  });

  it('adds extra_name/extra_value when an msisdn is supplied', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse(JSON.stringify({ success: true, data: {} })));
    await permanentUserService.createPermanentUser({ ...baseInput(), msisdn: '+27820000000' });
    const payload = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(payload).toMatchObject({ extra_name: 'msisdn', extra_value: '+27820000000' });
  });

  it('returns a record, mapping active:1 to true', async () => {
    fetchSpy.mockResolvedValueOnce(
      fetchResponse(JSON.stringify({ success: true, data: { username: 'alice', active: 1 } })),
    );
    const rec = await permanentUserService.createPermanentUser(baseInput());
    expect(rec).toMatchObject({
      username: 'alice',
      password: 'secret',
      realmId: 'realm-1',
      profileId: 'profile-1',
      active: true,
    });
  });

  it('maps a falsy active flag to false', async () => {
    fetchSpy.mockResolvedValueOnce(
      fetchResponse(JSON.stringify({ success: true, data: { active: 0 } })),
    );
    const rec = await permanentUserService.createPermanentUser(baseInput());
    expect(rec.active).toBe(false);
  });

  it('throws when the response reports success:false', async () => {
    fetchSpy.mockResolvedValueOnce(
      fetchResponse(JSON.stringify({ success: false, message: 'dup' })),
    );
    await expect(permanentUserService.createPermanentUser(baseInput())).rejects.toThrow(
      /RadiusDesk error/,
    );
  });

  it('throws on non-JSON response', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse('<html>502</html>'));
    await expect(permanentUserService.createPermanentUser(baseInput())).rejects.toThrow(
      /invalid JSON/,
    );
  });
});

describe('PermanentUserService helpers', () => {
  it('generateUsername strips non-numeric characters and prefixes', () => {
    expect(permanentUserService.generateUsername('+27 82 000 0000')).toBe('user27820000000');
    expect(permanentUserService.generateUsername('27820000000', 'pu')).toBe('pu27820000000');
  });

  it('generatePassword honours length and uses only the safe charset', () => {
    const pw = permanentUserService.generatePassword(16);
    expect(pw).toHaveLength(16);
    expect(pw).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]+$/);
  });
});
