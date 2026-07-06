import { NextRequest, NextResponse } from 'next/server';
import { brandingService } from '@/application/services';

export async function GET(req: NextRequest) {
  try {
    const ssid = req.nextUrl.searchParams.get('ssid');
    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    const config = await brandingService.get(ssid);
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
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
