import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/lib/services/package-service';

export async function GET(req: NextRequest) {
  const ssid = req.nextUrl.searchParams.get('ssid');
  if (!ssid) return NextResponse.json({ error: 'Missing ssid' }, { status: 400 });
  const list = await packageService.list(ssid);
  return NextResponse.json({ packages: list });
}
