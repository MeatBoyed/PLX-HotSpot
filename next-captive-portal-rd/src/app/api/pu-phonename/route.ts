import { NextRequest, NextResponse } from 'next/server';
import { permanentUserService } from '@/features/purchasing/permanent-user-service';
import { authService } from '@/application/services';
import type { ApiPortalPackage } from '@/infrastructure/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, otp } = body;

    if (!phone || !name) {
      return NextResponse.json({ success: false, error: 'Phone and name are required' }, { status: 400 });
    }
    if (!otp) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const trimmedPhone = String(phone).trim();
    const trimmedName = String(name).trim();
    if (!trimmedPhone || !trimmedName) {
      return NextResponse.json({ success: false, error: 'Phone and name are required' }, { status: 400 });
    }

    const msisdn = trimmedPhone.replace(/\D/g, '');
    if (!msisdn) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    const username = `jt_${msisdn}`;
    const password = trimmedName.replace(/\s+/g, '_').toLowerCase();

    console.log('[PU-PHONE] Login started and Credentials Verified', username);

    const ssid = String(body.ssid || '').trim();
    if (!ssid) {
      return NextResponse.json({ success: false, error: 'SSID is required' }, { status: 400 });
    }

    // Verify OTP via API
    try {
      await authService.verifyOtp({ phoneNumber: msisdn, code: String(otp).trim(), ssid });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired code';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const pkg: ApiPortalPackage = {
      id: 0,
      ssid,
      name: 'Default Package',
      price: 0,
      radiusProfile: 'default',
      radiusProfileId: 61,
    };

    try {
      await permanentUserService.createPermanentUser({
        username,
        password,
        pkg,
        msisdn,
        phone: trimmedPhone,
        name: trimmedName.split(/\s+/)[0] || '',
        surname: trimmedName.split(/\s+/)[1] || '',
      });
      console.log('[PU-PHONE] created new user', username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists|duplicate|already taken/i.test(msg)) {
        console.log('[PU-PHONE] user already exists, will login', username);
      } else {
        console.error('[PU-PHONE] error creating user', err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, username, password });
  } catch (error) {
    console.error('[PU-PHONE] unexpected error', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}
