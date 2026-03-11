/**
 * EC1 SMS Service
 * -----------------------------------------
 * Sends SMS via the EC1 Notification Engine API.
 * Authenticates with /apiLogin to get a SessionId (valid 10 min),
 * then sends SMS via /sendSMS.
 *
 * Credentials sourced from env: EC1_SMS_API_URL, EC1_SMS_USER_ID, EC1_SMS_PASSWORD
 */
import 'server-only';
import { env } from '@/env';

interface Ec1LoginResponse {
    SessionId: string;
    ResponseCode: string;
    ResponseDescription: string;
}

interface Ec1SmsResponse {
    ResponseCode: string;
    ResponseDescription: string;
}

const EC1_RESPONSE_CODES: Record<string, string> = {
    '00': 'Success',
    '01': 'System Error',
    '10': 'Invalid User Id',
    '11': 'Invalid Password',
    '12': 'Invalid User Id or Password',
    '14': 'User Id Blocked',
    '20': 'Invalid Session Id',
    '21': 'Invalid MSISDN',
    '22': 'Invalid Message',
    '91': 'Invalid Request Data',
    '92': 'System Error',
};

class Ec1SmsService {
    private sessionId: string | null = null;
    private sessionExpiresAt: number = 0; // timestamp ms

    private get baseUrl(): string {
        const url = env.EC1_SMS_API_URL;
        if (!url) throw new Error('EC1_SMS_API_URL is not configured');
        return url.replace(/\/$/, '');
    }

    private get userId(): string {
        const id = env.EC1_SMS_USER_ID;
        if (!id) throw new Error('EC1_SMS_USER_ID is not configured');
        return id;
    }

    private get password(): string {
        const pw = env.EC1_SMS_PASSWORD;
        if (!pw) throw new Error('EC1_SMS_PASSWORD is not configured');
        return pw;
    }

    /**
     * Authenticate with EC1 Notification Engine to obtain a SessionId.
     * The session is valid for 10 minutes; we cache for 9 min as safety margin.
     */
    private async login(): Promise<string> {
        const url = `${this.baseUrl}/apiLogin`;

        console.log('[EC1_SMS] Authenticating...');

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                UserId: this.userId,
                Password: this.password,
            }),
        });

        const text = await res.text();
        console.log('[EC1_SMS] Login response:', res.status, text);

        if (!res.ok) {
            console.log(`EC1 SMS login HTTP ${res.status}: ${text}`);
            throw new Error(`EC1 SMS login HTTP ${res.status}: ${text}`);
        }

        let data: Ec1LoginResponse;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(`EC1 SMS login returned invalid JSON: ${text}`);
        }

        if (data.ResponseCode !== '00') {
            const desc = EC1_RESPONSE_CODES[data.ResponseCode] || data.ResponseDescription;
            console.error('[EC1_SMS] Login failed:', data.ResponseCode, desc);
            throw new Error(`EC1 SMS login failed: ${desc} (code ${data.ResponseCode})`);
        }

        this.sessionId = data.SessionId;
        this.sessionExpiresAt = Date.now() + 9 * 60 * 1000; // 9 min

        console.log('[EC1_SMS] Authenticated, session cached');
        return this.sessionId;
    }

    /**
     * Get a valid session ID, re-authenticating if expired/missing.
     */
    private async getSession(): Promise<string> {
        if (this.sessionId && Date.now() < this.sessionExpiresAt) {
            return this.sessionId;
        }
        return this.login();
    }

    /**
     * Send an SMS to the given MSISDN.
     * @param msisdn 11-digit number starting with "27" (e.g. "27691234567")
     * @param message SMS text, max 250 characters
     */
    async sendSms(msisdn: string, message: string): Promise<{ responseCode: string; responseDescription: string }> {
        // Validate MSISDN format
        if (!/^27\d{9}$/.test(msisdn)) {
            throw new Error(`Invalid MSISDN format: "${msisdn}". Must be 11 digits starting with 27.`);
        }
        if (message.length > 250) {
            throw new Error(`Message exceeds 250 character limit (${message.length} chars)`);
        }

        const sessionId = await this.getSession();
        const url = `${this.baseUrl}/sendSMS`;

        console.log('[EC1_SMS] Sending SMS to', msisdn);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                SessionId: sessionId,
                MSISDN: msisdn,
                Message: message,
            }),
        });

        const smsText = await res.text();
        console.log('[EC1_SMS] Send response:', res.status, smsText);

        if (!res.ok) {
            throw new Error(`EC1 SMS send HTTP ${res.status}: ${smsText}`);
        }

        let data: Ec1SmsResponse;
        try {
            data = JSON.parse(smsText);
        } catch {
            throw new Error(`EC1 SMS send returned invalid JSON: ${smsText}`);
        }

        // If session expired mid-flight, retry once with fresh login
        if (data.ResponseCode === '20') {
            console.log('[EC1_SMS] Session expired, re-authenticating...');
            const freshSession = await this.login();
            const retryRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    SessionId: freshSession,
                    MSISDN: msisdn,
                    Message: message,
                }),
            });
            const retryText = await retryRes.text();
            let retryData: Ec1SmsResponse;
            try {
                retryData = JSON.parse(retryText);
            } catch {
                throw new Error(`EC1 SMS retry returned invalid JSON: ${retryText}`);
            }
            if (retryData.ResponseCode !== '00') {
                const desc = EC1_RESPONSE_CODES[retryData.ResponseCode] || retryData.ResponseDescription;
                console.error('[EC1_SMS] Send failed after retry:', retryData.ResponseCode, desc);
                throw new Error(`EC1 SMS send failed: ${desc} (code ${retryData.ResponseCode})`);
            }
            console.log('[EC1_SMS] SMS sent successfully (after retry)');
            return { responseCode: retryData.ResponseCode, responseDescription: retryData.ResponseDescription };
        }

        if (data.ResponseCode !== '00') {
            const desc = EC1_RESPONSE_CODES[data.ResponseCode] || data.ResponseDescription;
            console.error('[EC1_SMS] Send failed:', data.ResponseCode, desc);
            throw new Error(`EC1 SMS send failed: ${desc} (code ${data.ResponseCode})`);
        }

        console.log('[EC1_SMS] SMS sent successfully');
        return { responseCode: data.ResponseCode, responseDescription: data.ResponseDescription };
    }
}

export const ec1SmsService = new Ec1SmsService();
