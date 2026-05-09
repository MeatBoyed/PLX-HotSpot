import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/application/services';

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

        const msisdn = trimmedPhone.replace(/\D/g, '');
        if (!/^27\d{9}$/.test(msisdn)) {
            return NextResponse.json({ success: false, error: 'Invalid phone number. Must be a South African number.' }, { status: 400 });
        }

        const ssid = String(body.ssid || '').trim();
        if (!ssid) {
            return NextResponse.json({ success: false, error: 'SSID is required' }, { status: 400 });
        }
        await authService.requestOtp({ phoneNumber: msisdn, ssid });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SEND-OTP] unexpected error', error);
        return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
    }
}
