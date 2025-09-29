/**
 * PayFastService (server-side only)
 * -----------------------------------------
 * Implements the PayFast documentation Node.js sample "to the T":
 *
 * Signature generation rules (per PayFast docs):
 *  1) Concatenate non-blank name=value pairs with '&' in the order the fields appear
 *     in the attributes description (our code preserves insertion order of the fields object).
 *  2) Append passphrase as '&passphrase=...'
 *  3) URL-encode values with encodeURIComponent and replace spaces with '+' (uppercase hex, e.g. http%3A%2F%2F)
 *  4) signature = MD5 of the parameter string, hex digest (lowercase)
 *
 * Form posting rules:
 *  - Post to https://{pfHost}/eng/process (live or sandbox)
 *  - Include only non-blank inputs; order doesn't matter for HTML, but we keep it consistent
 */
import 'server-only';
import crypto from 'crypto';
import type { Plan } from './plan-catalog';

// Exact PayFast Node.js signature function (adapted to TypeScript)
const pfGenerateSignature = (
  data: Record<string, string>,
  passPhrase: string | null = null
): string => {
  // Create parameter string
  let pfOutput = '';
  for (const key in data) {
    if ((data as Record<string, unknown>).hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(getString).digest('hex');
};

interface BuildPaymentInput {
  plan: Plan;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string; // IPN endpoint
}

interface BuildPaymentResult {
  actionUrl: string;
  fields: Record<string, string>;
}

export class PayFastService {
  private readonly mode: 'sandbox' | 'live';
  private readonly merchantId?: string;
  private readonly merchantKey?: string;
  private readonly passphrase?: string; // Used in signature if provided (appended as &passphrase=...)
  private readonly debugSigning: boolean;

  constructor(env = process.env) {
    this.mode = (env.PAYFAST_MODE === 'live' ? 'live' : 'sandbox');
    this.merchantId = env.PAYFAST_MERCHANT_ID;
    this.merchantKey = env.PAYFAST_MERCHANT_KEY;
    this.passphrase = env.PAYFAST_PASSPHRASE;
    this.debugSigning = env.PAYFAST_DEBUG_SIGNING === '1' || env.PAYFAST_DEBUG_SIGNING === 'true';
  }

  private getActionUrl(): string {
    return this.mode === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';
  }

  // Public helper: generate signature using the exact PayFast sample
  public generateSignature(fields: Record<string, string>, passphrase: string | null = null): string {
    return pfGenerateSignature(fields, passphrase);
  }

  // Public helper: return { actionUrl, fields: { ...fields, signature } } preserving order
  public buildSignedFields(fieldsInOrder: Record<string, string>): { actionUrl: string; fields: Record<string, string> } {
    const signature = pfGenerateSignature(fieldsInOrder, this.passphrase ?? null);
    const fields: Record<string, string> = { ...fieldsInOrder, signature };
    return { actionUrl: this.getActionUrl(), fields };
  }

  buildPaymentFields(input: BuildPaymentInput): BuildPaymentResult {
    const { plan, returnUrl, cancelUrl, notifyUrl } = input;
    if (!this.merchantId || !this.merchantKey) {
      throw new Error('PayFastService: Missing required env (PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY).');
    }

    const amount = plan.price.toFixed(2); // Ensure two decimals
    // Ordered fields aligned to PayFast docs (merchant -> URLs -> buyer -> transaction)
    const baseFields = {
      // Merchant details
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      // Redirect URLs
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      // Buyer details (optional; leave blank to omit)
      // name_first: '',
      // name_last: '',
      // email_address: '',
      // Transaction details
      m_payment_id: String(plan.id),
      amount,
      item_name: plan.itemName,
    } as const;
    const fields: Record<string, string> = { ...baseFields };
    const signature = pfGenerateSignature(fields, this.passphrase ?? null);

    if (this.debugSigning) {
      // Recreate the exact signing string for debugging
      let pfOutput = '';
      for (const key in fields) {
        if ((fields as Record<string, unknown>).hasOwnProperty(key)) {
          const value = fields[key];
          if (value !== '') {
            pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, '+')}&`;
          }
        }
      }
      let getString = pfOutput.slice(0, -1);
      if ((this.passphrase ?? null) !== null) {
        getString += `&passphrase=${encodeURIComponent(String(this.passphrase ?? '').trim()).replace(/%20/g, '+')}`;
      }
      console.log('[PF:FORM:SIGN]', getString);
      console.log('[PF:FORM:SIG ]', signature);
    }
    fields.signature = signature;

    console.log(`[PF:FORM] plan=${plan.id} amount=${amount}`);
    return { actionUrl: this.getActionUrl(), fields };
  }

  verifySignature(payload: Record<string, string>): boolean {
    const sig = payload['signature'];
    if (!sig) return false;
    // Build pfParamString exactly like PayFast sample: iterate over posted fields, exclude 'signature'
    let pfParamString = '';
    for (const key in payload) {
      if ((payload as Record<string, unknown>).hasOwnProperty(key) && key !== 'signature') {
        const value = payload[key];
        pfParamString += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, '+')}&`;
      }
    }
    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);
    const effectivePass = this.passphrase && this.passphrase.trim() !== '' ? this.passphrase : null;
    if (effectivePass !== null) {
      pfParamString += `&passphrase=${encodeURIComponent(String(effectivePass).trim()).replace(/%20/g, '+')}`;
    }
    const expected = crypto.createHash('md5').update(pfParamString).digest('hex');
    if (this.debugSigning) {
      console.log('[PF:IPN:SIGN]', pfParamString);
      console.log('[PF:IPN:SIG ]', expected);
    }
    return sig === expected;
  }


}

// Singleton export (stateless aside from env config)
export const payFastService = new PayFastService();

/**
 * Usage (manual test sketch):
 * const plan = getPlan('1_gb_voucher');
 * if (plan) {
 *   const { actionUrl, fields } = payFastService.buildPaymentFields({
 *     plan,
 *     msisdn: '27820000000',
 *     returnUrl: 'https://example/return',
 *     cancelUrl: 'https://example/cancel',
 *     notifyUrl: 'https://example/api/payfast/ipn'
 *   });
 *   console.log(actionUrl, fields.signature);
 *   console.log('verify', payFastService.verifySignature(fields)); // true
 * }
 */
