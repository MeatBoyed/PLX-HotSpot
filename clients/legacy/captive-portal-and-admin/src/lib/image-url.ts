// Small utility to format branding image slugs into stable URLs
// Usage: <img src={imageUrl(theme.logo)} />

import { env } from '@/env';

/**
 * Returns a stable URL for a branding image slug, including the ssid query param.
 * Falls back to empty string if slug is falsy.
 */
export function imageUrl(slug?: string | null, ssid?: string | null): string {
  const s = (ssid ?? env.NEXT_PUBLIC_SSID ?? '').trim();
  const sl = (slug ?? '').trim();
  if (!sl) return '';
  const qp = s ? `?ssid=${encodeURIComponent(s)}` : '';
  return `/api/image/${encodeURIComponent(sl)}${qp}`;
}
