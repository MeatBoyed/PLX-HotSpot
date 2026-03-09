import { NextRequest, NextResponse } from 'next/server';
import { permanentUserService } from '@/features/purchasing/permanent-user-service';
import { Package, packageService } from '@/lib/services/package-service';
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

    // build credentials according to spec
    //const username = trimmedPhone;
    // password is first_surname (spaces replaced with underscores)
    //const password = trimmedName.replace(/\s+/g, '_');

    const msisdn = trimmedPhone.replace(/\D/g, ''); // 27691235789
    if (!msisdn) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    const username = `jt_${msisdn}`;                 // safe + unique
    const password = trimmedName.replace(/\s+/g, '_').toLowerCase(); // keeps it consistent

    console.log('[PU-PHONE] Login started and Credentials Verified', username);

    // locate a package for this SSID
    const ssid = env.NEXT_PUBLIC_SSID;
    // const packages = await packageService.list(ssid);
    // if (!packages || packages.length === 0) {
    //   console.error('[PU-PHONE] no packages for SSID', ssid);
    //   return NextResponse.json({ success: false, error: 'Service configuration error' }, { status: 500 });
    // }
    // const pkg = packages[0];
    const pkg: Package = {
      id: 0, // not used for pu-phonename flow
      ssid,
      name: 'Default Package',
      price: 0,
      radiusProfile: "default",
      radiusProfileId: 61,
    }

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
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      // handle both new user creation failures and existing user detection
      if (/already exists|duplicate|already taken/i.test(msg)) {
        // user already exists, that's fine - proceed to login
        console.log('[PU-PHONE] user already exists or taken, will login', username);
      } else {
        console.error('[PU-PHONE] error creating user', err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
      }
    }

    // return credentials so client can proceed to authenticate
    return NextResponse.json({ success: true, username, password });
  } catch (error) {
    console.error('[PU-PHONE] unexpected error', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}
