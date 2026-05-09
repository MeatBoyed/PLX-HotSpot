import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

const API_BASE = env.API_URL;

// Proxy image requests to the API's public image endpoint.
// The API serves images at /api/portal/images/{slug}?ssid={ssid}.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ssid = req.nextUrl.searchParams.get('ssid') || '';

  if (!ssid || !slug) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${API_BASE}/api/portal/images/${encodeURIComponent(slug)}?ssid=${encodeURIComponent(ssid)}`,
      { next: { revalidate: 3600 } }
    );

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[GET /api/image/[slug]]', err);
    return new NextResponse(null, { status: 502 });
  }
}
