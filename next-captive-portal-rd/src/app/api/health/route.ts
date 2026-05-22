import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.API_URL ?? '(not set)';
  const tenantId = process.env.TENANT_ID ?? '(not set)';
  const nodeEnv = process.env.NODE_ENV ?? '(not set)';

  // Probe the API to see if it's reachable
  let apiReachable = false;
  let apiError: string | null = null;
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/openapi/v1.json`, {
      signal: AbortSignal.timeout(5000),
    });
    apiReachable = res.ok;
    if (!res.ok) apiError = `HTTP ${res.status}`;
  } catch (e) {
    apiError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: nodeEnv,
      API_URL: apiUrl,
      TENANT_ID: tenantId,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '(not set)',
    },
    api: {
      reachable: apiReachable,
      error: apiError,
    },
  });
}
