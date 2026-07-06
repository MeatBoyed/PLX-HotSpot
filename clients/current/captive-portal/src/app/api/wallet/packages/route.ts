import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/infrastructure/http';
import { env } from '@/env';
import type { PortalPackage } from '@/infrastructure/api/types';

export async function GET(req: NextRequest) {
  const tenantId = env.TENANT_ID;
  if (!tenantId) {
    return NextResponse.json({ error: 'TENANT_ID is not configured' }, { status: 500 });
  }

  const ssid = new URL(req.url).searchParams.get('ssid') ?? undefined;

  try {
    const packages = await apiClient.get<PortalPackage[]>(`/portal/${tenantId}/packages`, { ssid });
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[GET /api/wallet/packages]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
