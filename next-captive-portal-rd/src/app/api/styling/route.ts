import { NextRequest, NextResponse } from 'next/server';
import { StylingService } from '@/lib/services/styling-service';

/**
 * GET /api/styling?ssid=<ssid>
 * Retrieve complete styling configuration for an SSID
 */
export async function GET(req: NextRequest) {
  try {
    const ssid = req.nextUrl.searchParams.get('ssid');
    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    const config = await StylingService.getComplete(ssid);
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache
      },
    });
  } catch (error) {
    console.error('[GET /api/styling]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch styling config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/styling
 * Update complete styling configuration
 * Body: Partial StylingConfigComplete with any sections to update
 */
export async function PUT(req: NextRequest) {
  try {
    const ssid = req.nextUrl.searchParams.get('ssid');
    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    const body = await req.json();
    const updated = await StylingService.updateComplete(ssid, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/styling]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update styling config' },
      { status: 500 }
    );
  }
}
