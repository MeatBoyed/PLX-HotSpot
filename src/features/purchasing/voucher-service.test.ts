import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Package } from '@/lib/services/package-service';

vi.mock('@/env', () => ({
  env: {
    MIKROTIK_RADIUS_DESK_BASE_URL: 'https://rd.test',
    RADIUSDESK_TOKEN: 'tok',
    VOUCHER_DEFAULT_TTL_HOURS: 24,
  },
}));

import { voucherService } from './voucher-service';

function makePackage(overrides: Partial<Package> = {}): Package {
  return {
    id: 1,
    ssid: 'PluxNet',
    name: 'Voucher Bundle',
    price: 50,
    radiusProfileId: 7,
    radiusProfile: 'default',
    radiusRealmId: 'realm-1',
    radiusCloudId: 'cloud-1',
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

describe('VoucherService.issueVoucher', () => {
  it('extracts the voucher code from the RadiusDesk response', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse(JSON.stringify({ data: { voucher: 'ABCD1234' } })));
    const rec = await voucherService.issueVoucher({
      paymentKey: 'pk-extract',
      pkg: makePackage(),
      msisdn: '+27820000000',
    });
    expect(rec.code).toBe('ABCD1234');
    expect(rec.profileId).toBe('7');
    expect(rec.msisdn).toBe('+27820000000');
  });

  it('is idempotent per paymentKey — second call returns the cached record without re-calling RadiusDesk', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse(JSON.stringify({ code: 'ONCE9999' })));
    const first = await voucherService.issueVoucher({
      paymentKey: 'pk-idem',
      pkg: makePackage(),
      msisdn: '+27820000001',
    });
    const second = await voucherService.issueVoucher({
      paymentKey: 'pk-idem',
      pkg: makePackage(),
      msisdn: '+27820000001',
    });
    expect(second).toBe(first);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('throws on a non-ok RadiusDesk response', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse('upstream boom', { ok: false, status: 500 }));
    await expect(
      voucherService.issueVoucher({ paymentKey: 'pk-err', pkg: makePackage(), msisdn: '+27820000002' }),
    ).rejects.toThrow(/RadiusDesk error 500/);
  });

  it('throws when the response carries no voucher code', async () => {
    fetchSpy.mockResolvedValueOnce(fetchResponse(JSON.stringify({ data: {} })));
    await expect(
      voucherService.issueVoucher({ paymentKey: 'pk-nocode', pkg: makePackage(), msisdn: '+27820000003' }),
    ).rejects.toThrow(/did not include a voucher code/);
  });

  it('throws when required RadiusDesk config is missing from the package', async () => {
    await expect(
      voucherService.issueVoucher({
        paymentKey: 'pk-cfg',
        pkg: makePackage({ radiusRealmId: null }),
        msisdn: '+27820000004',
      }),
    ).rejects.toThrow(/Missing config/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
