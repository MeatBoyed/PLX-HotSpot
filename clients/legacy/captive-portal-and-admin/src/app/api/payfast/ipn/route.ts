import { NextRequest, NextResponse } from 'next/server';
import { payFastService } from '@/features/purchasing/payfast-service';
import { voucherService } from '@/features/purchasing/voucher-service';
import { smsService } from '@/features/purchasing/sms-service';
import { listPlans } from '@/features/purchasing/plan-catalog';
import dns from 'dns';

/**
 * PayFast IPN (Instant Payment Notification) Handler (MVP)
 * -------------------------------------------------------
 * This minimal implementation:
 *  - Parses incoming form-encoded or JSON payload
 *  - Verifies signature using local passphrase algorithm
 *  - Issues (idempotent) voucher keyed by pf_payment_id (fallback m_payment_id)
 *  - Sends voucher via SmsService (non-blocking resilience)
 *  - Returns JSON summary
 *
 * NOTE: A production-grade PayFast IPN flow should also:
 *  - Perform a server-side validation POST back to PayFast (data validation step)
 *  - Persist transaction & voucher records durably
 *  - Handle payment_status values (COMPLETE, CANCELLED, etc.)
 * For MVP demo these are intentionally out of scope.
 */

async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const record: Record<string, string> = {};
    for (const [k, v] of params.entries()) record[k] = v;
    return record;
  }
  if (contentType.includes('application/json')) {
    const json = await req.json();
    const record: Record<string, string> = {};
    for (const k of Object.keys(json)) {
      const val = json[k];
      if (val != null) record[k] = String(val);
    }
    return record;
  }
  // Fallback attempt formData (multipart or otherwise)
  try {
    const form = await req.formData();
    const record: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      if (typeof v === 'string') record[k] = v;
    }
    return record;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await parseBody(req);
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
    }

    // 1) Signature verification (using exact PayFast algorithm)
    if (!payFastService.verifySignature(payload)) {
      console.warn('[PF:IPN] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2) Check that the notification came from a valid PayFast domain IP
    const validHosts = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za'
    ];
    const pfIp = req.headers.get('x-forwarded-for') || (req as any).ip || (req as any).socket?.remoteAddress || '';
    let validIps: string[] = [];
    try {
      const lookups = await Promise.all(
        validHosts.map(
          host => new Promise<string[]>((resolve, reject) => {
            dns.lookup(host, { all: true }, (err, addresses) => {
              if (err) return resolve([]); // don't reject IPN on DNS hiccup; we'll handle below
              resolve(addresses.map(a => a.address));
            });
          })
        )
      );
      validIps = [...new Set(lookups.flat())];
    } catch (e) {
      console.warn('[PF:IPN] DNS lookup error', e);
    }
    if (pfIp && validIps.length > 0 && !validIps.includes(pfIp)) {
      console.warn('[PF:IPN] Invalid source IP', pfIp);
      return NextResponse.json({ error: 'Invalid source IP' }, { status: 400 });
    }

    // Merchant id check
    if (process.env.PAYFAST_MERCHANT_ID && payload.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      console.warn('[PF:IPN:MERCHANT_MISMATCH]', payload.merchant_id);
      return NextResponse.json({ error: 'Merchant mismatch' }, { status: 400 });
    }

    // Map plan by item_name (minimal field set) and validate amount
    const plans = listPlans();
    const plan = plans.find(p => p.itemName === payload.item_name);
    if (!plan) {
      return NextResponse.json({ error: 'Unknown plan (item_name)' }, { status: 400 });
    }

    const expectedAmount = plan.price.toFixed(2);
    const amountOk = payload.amount === expectedAmount || payload.amount_gross === expectedAmount;
    if (!amountOk) {
      console.warn('[PF:IPN:AMOUNT_MISMATCH]', { got: payload.amount || payload.amount_gross, expected: expectedAmount });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Use global/hardcoded MSISDN
    const msisdn = process.env.PAYFAST_TEST_MSISDN || '27656853805';
    const paymentKey = payload.pf_payment_id || payload.m_payment_id || payload.signature; // fallback sequence

    // Issue (idempotent) voucher and attempt SMS
    const voucher = voucherService.issueVoucher({ paymentKey, planId: plan.id, msisdn });
    try {
      await smsService.sendVoucher({ msisdn, code: voucher.code });
    } catch (err) {
      console.warn('[PF:IPN] SMS dispatch error', err);
    }

    console.log(`[PF:IPN] plan=${plan.id} paymentKey=${paymentKey}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PF:IPN] Handler error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
