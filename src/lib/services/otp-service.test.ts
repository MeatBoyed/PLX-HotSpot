import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Hoisted mock fns so the vi.mock factories (also hoisted) can close over them.
const { findFirst, create, update, sendSms } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  sendSms: vi.fn(),
}));

vi.mock('@/lib/services/database-service', () => ({
  prisma: { otp_verification: { findFirst, create, update } },
}));
vi.mock('@/lib/services/ec1-sms-service', () => ({
  ec1SmsService: { sendSms },
}));

import { otpService } from './otp-service';

const SSID = 'PluxNet';
const MSISDN = '+27820000000';

beforeEach(() => {
  vi.clearAllMocks();
  findFirst.mockResolvedValue(null);
  create.mockResolvedValue({});
  update.mockResolvedValue({});
  sendSms.mockResolvedValue({ responseCode: '0', responseDescription: 'OK' });
});

describe('OtpService.generateAndSend', () => {
  it('rejects during the resend cooldown without sending or storing', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:00:00Z'));
    // a code created 10s ago — inside the 30s cooldown
    findFirst.mockResolvedValueOnce({ created_at: new Date('2026-06-29T11:59:50Z') });

    const res = await otpService.generateAndSend(SSID, MSISDN);

    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toMatch(/wait \d+s/);
    expect(sendSms).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('sends the SMS then stores the OTP on success', async () => {
    const res = await otpService.generateAndSend(SSID, MSISDN);

    expect(res).toEqual({ success: true });
    expect(sendSms).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    const stored = create.mock.calls[0][0].data;
    expect(stored).toMatchObject({ ssid: SSID, msisdn: MSISDN });
    expect(stored.otp_code).toMatch(/^\d{4}$/);
  });

  it('does not store the OTP when SMS delivery fails', async () => {
    sendSms.mockRejectedValueOnce(new Error('gateway down'));

    const res = await otpService.generateAndSend(SSID, MSISDN);

    expect(res.success).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('generates a 4-digit code in the 1000–9999 range', async () => {
    for (let i = 0; i < 200; i++) {
      create.mockClear();
      await otpService.generateAndSend(SSID, MSISDN);
      const code = Number(create.mock.calls[0][0].data.otp_code);
      expect(code).toBeGreaterThanOrEqual(1000);
      expect(code).toBeLessThanOrEqual(9999);
    }
  });
});

describe('OtpService.verify', () => {
  it('errors when there is no active code', async () => {
    findFirst.mockResolvedValueOnce(null);
    const res = await otpService.verify(SSID, MSISDN, '1234');
    expect(res).toEqual({
      success: false,
      error: 'No active verification code. Please request a new one.',
    });
  });

  it('rejects once attempts have reached the max', async () => {
    findFirst.mockResolvedValueOnce({ id: 1, otp_code: '1234', attempts: 3 });
    const res = await otpService.verify(SSID, MSISDN, '1234');
    expect(res).toEqual({
      success: false,
      error: 'Too many attempts. Please request a new code.',
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('increments attempts and reports remaining on a wrong code', async () => {
    findFirst.mockResolvedValueOnce({ id: 9, otp_code: '1234', attempts: 0 });
    const res = await otpService.verify(SSID, MSISDN, '0000');
    expect(res).toEqual({ success: false, error: 'Invalid code. 2 attempts remaining.' });
    expect(update).toHaveBeenCalledWith({ where: { id: 9 }, data: { attempts: 1 } });
  });

  it('reports "too many attempts" when the last attempt is wrong', async () => {
    findFirst.mockResolvedValueOnce({ id: 9, otp_code: '1234', attempts: 2 });
    const res = await otpService.verify(SSID, MSISDN, '0000');
    expect(res).toEqual({
      success: false,
      error: 'Too many attempts. Please request a new code.',
    });
  });

  it('verifies a correct code (trimmed) and marks the record verified', async () => {
    findFirst.mockResolvedValueOnce({ id: 5, otp_code: '1234', attempts: 0 });
    const res = await otpService.verify(SSID, MSISDN, '  1234  ');
    expect(res).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith({ where: { id: 5 }, data: { verified: true } });
  });
});

afterEach(() => {
  vi.useRealTimers();
});
