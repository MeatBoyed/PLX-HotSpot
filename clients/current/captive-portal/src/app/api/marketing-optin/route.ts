import { NextRequest, NextResponse } from 'next/server';
import { portalMarketingApi } from '@/infrastructure/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    await portalMarketingApi.subscribe(ssid, email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[marketing-optin] subscribe error:', err);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}

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

  try {
    await portalMarketingApi.unsubscribe(ssid, email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[marketing-optin] unsubscribe error:', err);
    return NextResponse.json({ error: 'Failed to process unsubscribe' }, { status: 500 });
  }
}
