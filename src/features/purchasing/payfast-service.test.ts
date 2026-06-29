import { describe, it, expect } from 'vitest';
import { PayFastService } from './payfast-service';
import type { Package } from '@/lib/services/package-service';

function makePackage(overrides: Partial<Package> = {}): Package {
  return {
    id: 7,
    ssid: 'PluxNet',
    name: 'Data Bundle',
    price: 99,
    radiusProfileId: 1,
    radiusProfile: 'default',
    ...overrides,
  };
}

const MERCHANT_ENV = {
  PAYFAST_MODE: 'sandbox',
  PAYFAST_MERCHANT_ID: '10000100',
  PAYFAST_MERCHANT_KEY: '46f0cd694581a',
} as const;

const URLS = {
  returnUrl: 'https://ex.com/return',
  cancelUrl: 'https://ex.com/cancel',
  notifyUrl: 'https://ex.com/ipn',
};

// Independently-computed MD5 known-answer vectors (see signing rules in the
// service header). Recompute with:
//   crypto.createHash('md5').update(<signing string>).digest('hex')

describe('PayFastService.generateSignature', () => {
  const svc = new PayFastService({ PAYFAST_MODE: 'sandbox' });

  it('MD5s the name=value string in insertion order (no passphrase)', () => {
    // signing string: merchant_id=10000100&merchant_key=46f0cd694581a
    expect(
      svc.generateSignature({ merchant_id: '10000100', merchant_key: '46f0cd694581a' }),
    ).toBe('af91b63243bdf01bcbbf04e6b7c713c2');
  });

  it('URL-encodes values and renders spaces as "+"', () => {
    // signing string: item_name=My+Item
    expect(svc.generateSignature({ item_name: 'My Item' })).toBe(
      'c7d24f760ef30bfa29a44188299afbeb',
    );
  });

  it('percent-encodes reserved characters (uppercase hex)', () => {
    // signing string: return_url=https%3A%2F%2Fex.com%2Fr
    expect(svc.generateSignature({ return_url: 'https://ex.com/r' })).toBe(
      'df1eb00e521408fed58935f3ef861013',
    );
  });

  it('skips blank-valued fields entirely', () => {
    const withBlank = svc.generateSignature({
      merchant_id: '10000100',
      name_first: '',
      merchant_key: '46f0cd694581a',
    });
    const without = svc.generateSignature({
      merchant_id: '10000100',
      merchant_key: '46f0cd694581a',
    });
    expect(withBlank).toBe(without);
    expect(withBlank).toBe('af91b63243bdf01bcbbf04e6b7c713c2');
  });

  it('trims values before encoding', () => {
    expect(svc.generateSignature({ item_name: '  My Item  ' })).toBe(
      'c7d24f760ef30bfa29a44188299afbeb',
    );
  });

  it('appends &passphrase=... when a passphrase is supplied', () => {
    // signing string: ...&passphrase=secret+pass
    expect(
      svc.generateSignature(
        { merchant_id: '10000100', merchant_key: '46f0cd694581a' },
        'secret pass',
      ),
    ).toBe('a537bc281d1f1b4c52c56fdbdb180f71');
  });
});

describe('PayFastService.verifySignature', () => {
  it('accepts a signature it generated for the same payload (no passphrase)', () => {
    const svc = new PayFastService({ PAYFAST_MODE: 'sandbox' });
    const payload: Record<string, string> = {
      merchant_id: '10000100',
      amount: '99.00',
      item_name: 'Data Bundle',
    };
    payload.signature = svc.generateSignature(payload);
    expect(svc.verifySignature(payload)).toBe(true);
  });

  it('round-trips with a passphrase configured on the service', () => {
    const svc = new PayFastService({ PAYFAST_MODE: 'sandbox', PAYFAST_PASSPHRASE: 'secret pass' });
    const payload: Record<string, string> = { merchant_id: '10000100', amount: '99.00' };
    // service applies its own passphrase when signing form fields...
    payload.signature = svc.generateSignature(payload, 'secret pass');
    expect(svc.verifySignature(payload)).toBe(true);
  });

  it('rejects a tampered field', () => {
    const svc = new PayFastService({ PAYFAST_MODE: 'sandbox' });
    const payload: Record<string, string> = { merchant_id: '10000100', amount: '99.00' };
    payload.signature = svc.generateSignature(payload);
    payload.amount = '0.01';
    expect(svc.verifySignature(payload)).toBe(false);
  });

  it('rejects a payload with no signature', () => {
    const svc = new PayFastService({ PAYFAST_MODE: 'sandbox' });
    expect(svc.verifySignature({ merchant_id: '10000100' })).toBe(false);
  });

  it('treats a whitespace-only passphrase as no passphrase', () => {
    const blank = new PayFastService({ PAYFAST_MODE: 'sandbox', PAYFAST_PASSPHRASE: '   ' });
    const none = new PayFastService({ PAYFAST_MODE: 'sandbox' });
    const payload: Record<string, string> = { merchant_id: '10000100', amount: '99.00' };
    // signed with NO passphrase; the whitespace-passphrase service must still accept it
    payload.signature = none.generateSignature(payload);
    expect(blank.verifySignature(payload)).toBe(true);
  });
});

describe('PayFastService.buildPaymentFields', () => {
  it('throws when merchant id/key env is missing', () => {
    const svc = new PayFastService({ PAYFAST_MODE: 'sandbox' });
    expect(() => svc.buildPaymentFields({ pkg: makePackage(), ...URLS })).toThrow(
      /Missing required env/,
    );
  });

  it('formats the amount to two decimals', () => {
    const svc = new PayFastService(MERCHANT_ENV);
    const { fields } = svc.buildPaymentFields({ pkg: makePackage({ price: 10.5 }), ...URLS });
    expect(fields.amount).toBe('10.50');
  });

  it('maps package + url fields and stringifies the payment id', () => {
    const svc = new PayFastService(MERCHANT_ENV);
    const { fields } = svc.buildPaymentFields({
      pkg: makePackage({ id: 42, name: 'Weekly Pass', price: 99 }),
      ...URLS,
    });
    expect(fields.merchant_id).toBe('10000100');
    expect(fields.merchant_key).toBe('46f0cd694581a');
    expect(fields.return_url).toBe(URLS.returnUrl);
    expect(fields.cancel_url).toBe(URLS.cancelUrl);
    expect(fields.notify_url).toBe(URLS.notifyUrl);
    expect(fields.m_payment_id).toBe('42');
    expect(fields.amount).toBe('99.00');
    expect(fields.item_name).toBe('Weekly Pass');
  });

  it('sets name_first to the cell number when supplied', () => {
    const svc = new PayFastService(MERCHANT_ENV);
    const { fields } = svc.buildPaymentFields({
      pkg: makePackage(),
      ...URLS,
      cellNumber: '+27820000000',
    });
    expect(fields.name_first).toBe('+27820000000');
  });

  it('attaches a signature equal to generateSignature over the signed fields', () => {
    const svc = new PayFastService(MERCHANT_ENV);
    const { fields } = svc.buildPaymentFields({ pkg: makePackage(), ...URLS });
    const { signature, ...signed } = fields;
    expect(signature).toMatch(/^[a-f0-9]{32}$/);
    expect(signature).toBe(svc.generateSignature(signed));
  });

  it('self-verifies once no blank fields remain (cell number populates name_first)', () => {
    // NOTE: with a blank name_first, signing skips it but verifySignature includes
    // it, so the form fields do NOT self-verify. That asymmetry is logged in the
    // slice doc. With name_first populated there is no blank field, so it verifies.
    const svc = new PayFastService(MERCHANT_ENV);
    const { fields } = svc.buildPaymentFields({
      pkg: makePackage(),
      ...URLS,
      cellNumber: '+27820000000',
    });
    expect(svc.verifySignature(fields)).toBe(true);
  });

  it('targets the sandbox action url in sandbox mode and live url in live mode', () => {
    const sandbox = new PayFastService(MERCHANT_ENV);
    const live = new PayFastService({ ...MERCHANT_ENV, PAYFAST_MODE: 'live' });
    expect(sandbox.buildPaymentFields({ pkg: makePackage(), ...URLS }).actionUrl).toBe(
      'https://sandbox.payfast.co.za/eng/process',
    );
    expect(live.buildPaymentFields({ pkg: makePackage(), ...URLS }).actionUrl).toBe(
      'https://www.payfast.co.za/eng/process',
    );
  });
});
