import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/services/otp-service';
import { env } from '@/env';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, name } = body;

        if (!phone || !name) {
            return NextResponse.json({ success: false, error: 'Phone and name are required' }, { status: 400 });
        }

        const trimmedPhone = String(phone).trim();
        const trimmedName = String(name).trim();
        if (!trimmedPhone || !trimmedName) {
            return NextResponse.json({ success: false, error: 'Phone and name are required' }, { status: 400 });
        }

        // Extract MSISDN (digits only, e.g. "27691234567")
        const msisdn = trimmedPhone.replace(/\D/g, '');
        if (!/^27\d{9}$/.test(msisdn)) {
            return NextResponse.json({ success: false, error: 'Invalid phone number. Must be a South African number.' }, { status: 400 });
        }

        const ssid = env.NEXT_PUBLIC_SSID;
        const result = await otpService.generateAndSend(ssid, msisdn);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 429 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SEND-OTP] unexpected error', error);
        return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
    }
}
