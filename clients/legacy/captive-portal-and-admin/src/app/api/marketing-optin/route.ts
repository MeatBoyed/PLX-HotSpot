import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/database-service';

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

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? req.headers.get('x-real-ip')
        ?? null;
    const userAgent = req.headers.get('user-agent') ?? null;

    try {
        await prisma.marketing_opt_in_submission.upsert({
            where: { marketing_opt_in_ssid_email_unique: { ssid, email } },
            create: { ssid, email, agreed: true, ip_address: ip, user_agent: userAgent },
            // If they re-submit (e.g. re-checked the box), just refresh the timestamp
            update: { agreed: true, unsubscribed: false, unsubscribed_at: null, ip_address: ip },
        });
    } catch (err) {
        console.error('[marketing-optin] DB error:', err);
        return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
