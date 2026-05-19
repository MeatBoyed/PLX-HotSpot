import { apiClient } from '@/infrastructure/http'
import { normalizeBranding } from '@/lib/utils/branding-normalize'
import type { BrandingConfig } from '@/lib/types'
import type { components } from '@/infrastructure/api/schema'
import { env } from '@/env'

type PortalBrandingResponse = components['schemas']['PortalBrandingResponse']

// Relative image URLs from the API need the public API host prepended so the
// browser can reach them. Absolute URLs (http/https) are returned as-is.
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function toAppBranding(api: PortalBrandingResponse): BrandingConfig {
  return normalizeBranding({
    ssid: api.ssid,
    name: api.displayName ?? undefined,
    brandPrimary: api.brandPrimary,
    brandPrimaryHover: api.brandPrimaryHover,
    brandSecondary: api.brandSecondary,
    brandAccent: api.brandAccent,
    textPrimary: api.textPrimary,
    textSecondary: api.textSecondary,
    textTertiary: api.textTertiary,
    textMuted: api.textMuted,
    surfaceCard: api.surfaceCard,
    surfaceWhite: api.surfaceWhite,
    surfaceBorder: api.surfaceBorder,
    buttonPrimary: api.buttonPrimary,
    buttonPrimaryHover: api.buttonPrimaryHover,
    buttonPrimaryText: api.buttonPrimaryText,
    buttonSecondary: api.buttonSecondary,
    buttonSecondaryHover: api.buttonSecondaryHover,
    buttonSecondaryText: api.buttonSecondaryText,
    logo: resolveImageUrl(api.logoUrl),
    logoWhite: resolveImageUrl(api.logoWhiteUrl),
    connectCardBackground: resolveImageUrl(api.connectCardBgUrl),
    bannerOverlay: resolveImageUrl(api.bannerOverlayUrl),
    favicon: resolveImageUrl(api.faviconUrl),
    splashBackground: resolveImageUrl(api.splashBgUrl),
    heading: api.heading ?? null,
    subheading: api.subheading ?? null,
    splashHeading: api.splashHeading ?? null,
    buttonText: api.buttonText ?? null,
    termsLinks: api.termsLinks ?? null,
    venueLabel: api.venueLabel ?? null,
    venueRoute: api.venueRoute ?? null,
    sortOrder: typeof api.sortOrder === 'number' ? api.sortOrder : undefined,
    authMethods: api.authMethods?.filter(
      (m): m is 'free' | 'voucher' | 'pu-login' | 'pu-phonename' =>
        m === 'free' || m === 'voucher' || m === 'pu-login' || m === 'pu-phonename'
    ),
    marketingOptIn: api.marketingOptIn,
    adsEnabled: api.adsEnabled,
    adsReviveServerUrl: api.adsReviveServerUrl ?? null,
    adsZoneId: api.adsReviveZoneId ?? null,
    adsReviveId: api.adsReviveId ?? null,
    adsVastUrl: api.adsVastUrl ?? null,
  })
}

export const portalBrandingApi = {
  async get(ssid: string): Promise<BrandingConfig> {
    const tenantId = env.TENANT_ID
    if (!tenantId) throw new Error('TENANT_ID is not configured — set it in .env before fetching branding')
    const data = await apiClient.get<PortalBrandingResponse>(`/portal/${tenantId}/branding`, { ssid })
    return toAppBranding(data)
  },
}
