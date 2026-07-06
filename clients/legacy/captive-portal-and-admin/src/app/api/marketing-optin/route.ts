import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/database-service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getIp(req: NextRequest): string | null {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        req.headers.get('cf-connecting-ip') ?? // Cloudflare
        null
    );
}

// POST — subscribe
export async function POST(req: NextRequest) {
    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null)
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { email, ssid } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_RE.test(email))
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (typeof ssid !== 'string' || !ssid.trim())
        return NextResponse.json({ error: 'ssid required' }, { status: 400 });

    try {
        await prisma.marketing_opt_in_submission.upsert({
            where: { ssid_email: { ssid, email } },
            create: {
                ssid,
                email,
                agreed: true,
                ip_address: getIp(req),
                user_agent: req.headers.get('user-agent') ?? null,
            },
            update: {
                agreed: true,
                unsubscribed: false,
                unsubscribed_at: null,
                ip_address: getIp(req),
            },
        });
    } catch (err) {
        console.error('[marketing-optin] subscribe error:', err);
        return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// PATCH — unsubscribe
export async function PATCH(req: NextRequest) {
    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null)
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { email, ssid } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_RE.test(email))
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (typeof ssid !== 'string' || !ssid.trim())
        return NextResponse.json({ error: 'ssid required' }, { status: 400 });

    const existing = await prisma.marketing_opt_in_submission.findUnique({
        where: { ssid_email: { ssid, email } },
    });

    if (!existing)
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });

    if (existing.unsubscribed)
        return NextResponse.json({ alreadyUnsubscribed: true });

    await prisma.marketing_opt_in_submission.update({
        where: { ssid_email: { ssid, email } },
        data: { unsubscribed: true, unsubscribed_at: new Date() },
    });

    return NextResponse.json({ success: true });
}
