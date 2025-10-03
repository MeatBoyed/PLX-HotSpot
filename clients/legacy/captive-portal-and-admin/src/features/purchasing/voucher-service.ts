/**
 * VoucherService (in-memory; demo scope)
 * -----------------------------------------
 * Issues idempotent voucher codes keyed by a paymentKey. Purely ephemeral
 * (non-persistent) storage suitable for local dev / demo flows. A future
 * implementation may persist to a database and integrate with RADIUS.
 */
import 'server-only';
import { env } from '@/env';

interface IssueVoucherInput {
  paymentKey: string; // Typically PayFast pf_payment_id or custom tracking id
  planId: string;
  msisdn: string;
  ttlHours?: number;
}

export interface VoucherRecord {
  code: string;
  planId: string;
  msisdn: string;
  createdAt: Date;
  expiresAt: Date;
}

const DEFAULT_TTL_HOURS = Number(env.VOUCHER_DEFAULT_TTL_HOURS || 24);

class VoucherService {
  private store = new Map<string, VoucherRecord>();

  private getRadiusDeskConfig() {
    const baseUrl = env.MIKROTIK_RADIUS_DESK_BASE_URL; // Prefer shared base URL from env.ts
    const token = env.RADIUSDESK_TOKEN;
    const realmId = env.RADIUSDESK_REALM_ID;
    const profileId = env.RADIUSDESK_PROFILE_ID;
    const cloudId = env.RADIUSDESK_CLOUD_ID;
    const missing = [
      !baseUrl && 'RADIUSDESK_BASE_URL',
      !token && 'RADIUSDESK_TOKEN',
      !realmId && 'RADIUSDESK_REALM_ID',
      !profileId && 'RADIUSDESK_PROFILE_ID',
      !cloudId && 'RADIUSDESK_CLOUD_ID',
    ].filter(Boolean) as string[];
    if (missing.length) {
      throw new Error(`VoucherService: Missing env vars: ${missing.join(', ')}`);
    }
    return { baseUrl: String(baseUrl), token: String(token), realmId: String(realmId), profileId: String(profileId), cloudId: String(cloudId) };
  }

  private extractVoucherCode(obj: any): string | null {
    if (obj == null) return null;
    // Common field guesses from RadiusDesk payloads
    const candidates = ['voucher', 'code', 'password', 'name', 'username'];
    for (const key of candidates) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim().length > 0) return v.trim();
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const got = this.extractVoucherCode(item);
        if (got) return got;
      }
    } else if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const got = this.extractVoucherCode(obj[k]);
        if (got) return got;
      }
    }
    return null;
  }

  private async createVoucherViaRadiusDesk(): Promise<string> {
    const { baseUrl, token, realmId, profileId, cloudId } = this.getRadiusDeskConfig();
    const url = new URL('/cake4/rd_cake/vouchers/add.json', baseUrl.replace(/\/$/, ''));
    const params = new URLSearchParams();
    params.append('single_field', 'true');
    params.append('realm_id', realmId);
    params.append('profile_id', profileId);
    params.append('quantity', '1');
    params.append('activate_on_login', 'on');
    params.append('days_valid', '0');
    params.append('hours_valid', '0');
    params.append('minutes_valid', '0');
    params.append('never_expire', 'on');
    params.append('extra_name', '');
    params.append('extra_value', '');
    params.append('token', token);
    params.append('cloud_id', cloudId);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      redirect: 'follow' as RequestRedirect,
    });
    const text = await res.text();
    let code: string | null = null;
    try {
      const json = JSON.parse(text);
      code = this.extractVoucherCode(json);
    } catch {
      // not JSON; fall through
    }
    if (!res.ok) {
      throw new Error(`RadiusDesk error ${res.status}: ${text.slice(0, 500)}`);
    }
    if (!code) {
      throw new Error('RadiusDesk response did not include a voucher code');
    }
    return code;
  }

  async issueVoucher(input: IssueVoucherInput): Promise<VoucherRecord> {
    const { paymentKey, planId, msisdn } = input;
    const ttlHours = input.ttlHours ?? DEFAULT_TTL_HOURS;
    const existing = this.store.get(paymentKey);
    if (existing) return existing;

    // Create via RadiusDesk
    const code = await this.createVoucherViaRadiusDesk();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const record: VoucherRecord = { code, planId, msisdn, createdAt: now, expiresAt };
    this.store.set(paymentKey, record);
    console.log(`[VOUCHER:CREATED] paymentKey=${paymentKey} code=${code} plan=${planId} msisdn=${msisdn}`);
    return record;
  }

  getVoucher(paymentKey: string): VoucherRecord | null {
    return this.store.get(paymentKey) || null;
  }
}

export const voucherService = new VoucherService();

// Usage (manual sketch):
// const rec = voucherService.issueVoucher({ paymentKey: 'test123', planId: '1_gb_voucher', msisdn: '27820000000' });
// console.log(rec.code);
// console.log(voucherService.issueVoucher({ paymentKey: 'test123', planId: '1_gb_voucher', msisdn: '27820000000' }).code === rec.code); // true
