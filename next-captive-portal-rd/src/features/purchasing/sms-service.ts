/**
 * SmsService (HTTP stub / dry-run)
 * -----------------------------------------
 * Sends voucher codes via an external SMS API. If SMS_API_URL is not set,
 * falls back to dry-run logging. Failures do not throw; they are logged and
 * the calling flow can continue.
 */
import 'server-only';

interface SendVoucherInput {
  msisdn: string;
  code: string;
}

export class SmsService {
  private readonly apiUrl?: string;
  private readonly apiKey?: string;

  constructor(env = process.env) {
    this.apiUrl = env.SMS_API_URL;
    this.apiKey = env.SMS_API_KEY;
  }

  async sendVoucher({ msisdn, code }: SendVoucherInput): Promise<void> {
    if (!this.apiUrl) {
      console.log(`[SMS:DRYRUN] to=${msisdn} code=${code}`);
      return;
    }
    try {
      // Build URL with query parameters per provider spec
      const url = new URL(this.apiUrl);
      const params = new URLSearchParams(url.search);
      const message = `Your voucher code: ${code}`;
      const messageId = `voucher_${Date.now()}`;
      params.set('ud', message);   // user data / message content
      params.set('da', msisdn);    // destination address (msisdn)
      params.set('id', messageId); // client message id
      url.search = params.toString();

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          // Match example headers
          'content-type': 'multipart/form-data',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        }
      });
      if (res.ok) {
        console.log(`[SMS:SENT] to=${msisdn} code=${code}`);
      } else {
        const text = await res.text().catch(() => '');
        console.warn(`[SMS:FAILED] to=${msisdn} status=${res.status} body=${text}`);
      }
    } catch (err) {
      console.warn(`[SMS:FAILED] to=${msisdn} error=${(err as Error).message}`);
      console.log('[SMS:FAILED:ERR] ', err);
    }
  }
}

export const smsService = new SmsService();

// Usage (manual sketch):
// await smsService.sendVoucher({ msisdn: '27820000000', code: 'ABC123XYZ9' });
