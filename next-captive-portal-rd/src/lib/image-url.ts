// Small utility to format branding image slugs into stable URLs.
// Usage: <img src={imageUrl(theme.logo, theme.ssid)} />
//
// If the value is already an absolute URL (resolved by branding.api.ts),
// it is returned as-is. Relative slugs are still routed through the portal
// image proxy at /api/image/[slug].

export function imageUrl(slug?: string | null, ssid?: string | null): string {
    const sl = (slug ?? '').trim();
    if (!sl) return '';
    if (sl.startsWith('http://') || sl.startsWith('https://')) return sl;
    const s = (ssid ?? '').trim();
    const qp = s ? `?ssid=${encodeURIComponent(s)}` : '';
    return `/api/image/${encodeURIComponent(sl)}${qp}`;
}
