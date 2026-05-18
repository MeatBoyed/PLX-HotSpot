let _token: string | null = null;

export function setToken(t: string | null): void {
  _token = t;
}

export async function platformRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.title ?? body.error ?? body.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status });
  }
  // 204 No Content or empty body — return undefined cast to T
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
