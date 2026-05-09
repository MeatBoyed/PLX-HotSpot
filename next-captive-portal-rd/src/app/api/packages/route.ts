import { NextRequest, NextResponse } from 'next/server';
import { packagesService } from '@/application/services';

export async function GET(req: NextRequest) {
  const ssid = req.nextUrl.searchParams.get('ssid');
  if (!ssid) return NextResponse.json({ error: 'Missing ssid' }, { status: 400 });

  try {
    const packages = await packagesService.list(ssid);
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[GET /api/packages]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
