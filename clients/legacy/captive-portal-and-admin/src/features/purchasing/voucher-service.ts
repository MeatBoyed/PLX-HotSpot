/**
 * VoucherService (in-memory; demo scope)
 * -----------------------------------------
 * Issues idempotent voucher codes keyed by a paymentKey. Purely ephemeral
 * (non-persistent) storage suitable for local dev / demo flows. A future
 * implementation may persist to a database and integrate with RADIUS.
 */
import 'server-only';

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

const DEFAULT_TTL_HOURS = Number(process.env.VOUCHER_DEFAULT_TTL_HOURS || '24');
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes 0,O,1,I
const CODE_LENGTH = 10;

class VoucherService {
  private store = new Map<string, VoucherRecord>();

  private generateCode(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
    }
    return code;
  }

  issueVoucher(input: IssueVoucherInput): VoucherRecord {
    const { paymentKey, planId, msisdn } = input;
    const ttlHours = input.ttlHours ?? DEFAULT_TTL_HOURS;
    const existing = this.store.get(paymentKey);
    if (existing) return existing;

    let code = this.generateCode();
    // Extremely low probability of collision; retry once defensively.
    if ([...this.store.values()].some(r => r.code === code)) {
      code = this.generateCode();
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const record: VoucherRecord = { code, planId, msisdn, createdAt: now, expiresAt };
    this.store.set(paymentKey, record);
    console.log(`[VOUCHER:GENERATED] paymentKey=${paymentKey} code=${code} plan=${planId} msisdn=${msisdn}`);
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
