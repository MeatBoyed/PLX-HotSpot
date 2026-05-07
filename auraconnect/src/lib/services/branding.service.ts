import { brandingApi } from '@/lib/infrastructure/api/branding.api'
import type { ApiBranding } from '@/lib/infrastructure/api/types'
import type { BrandingConfig, UpdateBrandingInput } from '@/lib/types/branding.types'

function toBrandingConfig(api: ApiBranding): BrandingConfig {
  return {
    siteId: api.siteId,
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
    logoUrl: api.logoUrl,
    logoWhiteUrl: api.logoWhiteUrl,
    connectCardBgUrl: api.connectCardBgUrl,
    bannerOverlayUrl: api.bannerOverlayUrl,
    faviconUrl: api.faviconUrl,
    splashBgUrl: api.splashBgUrl,
    displayName: api.displayName,
    heading: api.heading,
    subheading: api.subheading,
    splashHeading: api.splashHeading,
    buttonText: api.buttonText,
    termsLinks: api.termsLinks,
    venueLabel: api.venueLabel,
    venueRoute: api.venueRoute,
    sortOrder: api.sortOrder,
  }
}

export const brandingService = {
  async getBySiteId(siteId: string): Promise<BrandingConfig> {
    const api = await brandingApi.getBranding(siteId)
    if (!api) return { siteId }
    return toBrandingConfig(api)
  },

  async update(siteId: string, input: UpdateBrandingInput): Promise<void> {
    await brandingApi.updateBranding(siteId, input)
  },
}
