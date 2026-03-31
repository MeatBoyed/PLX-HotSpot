import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const { email, ssid } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (typeof ssid !== 'string' || !ssid.trim()) {
        return NextResponse.json({ error: 'ssid required' }, { status: 400 });
    }

    console.log('[marketing-optin]', { email, ssid, ts: new Date().toISOString() });

    // TODO: connect to real marketing service (e.g. Mailchimp, SendGrid, etc.)

    return NextResponse.json({ success: true });
}
