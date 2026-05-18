import { NextResponse } from 'next/server';
import { apiClient } from '@/infrastructure/http';
import { env } from '@/env';
import type { PortalPackage } from '@/infrastructure/api/types';

export async function GET() {
  const tenantId = env.TENANT_ID;
  if (!tenantId) {
    return NextResponse.json({ error: 'TENANT_ID is not configured' }, { status: 500 });
  }

  try {
    const packages = await apiClient.get<PortalPackage[]>(`/portal/${tenantId}/packages`);
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[GET /api/wallet/packages]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
