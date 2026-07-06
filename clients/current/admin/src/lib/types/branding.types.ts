export interface BrandingConfig {
  siteId: string
  // Colors
  brandPrimary?: string | null
  brandPrimaryHover?: string | null
  brandSecondary?: string | null
  brandAccent?: string | null
  textPrimary?: string | null
  textSecondary?: string | null
  textTertiary?: string | null
  textMuted?: string | null
  surfaceCard?: string | null
  surfaceWhite?: string | null
  surfaceBorder?: string | null
  buttonPrimary?: string | null
  buttonPrimaryHover?: string | null
  buttonPrimaryText?: string | null
  buttonSecondary?: string | null
  buttonSecondaryHover?: string | null
  buttonSecondaryText?: string | null
  // Images
  logoUrl?: string | null
  logoWhiteUrl?: string | null
  connectCardBgUrl?: string | null
  bannerOverlayUrl?: string | null
  faviconUrl?: string | null
  splashBgUrl?: string | null
  // Content
  displayName?: string | null
  heading?: string | null
  subheading?: string | null
  splashHeading?: string | null
  buttonText?: string | null
  termsLinks?: string | null
  venueLabel?: string | null
  venueRoute?: string | null
  sortOrder?: number | null
  updatedAt?: string
}

export type UpdateBrandingInput = Omit<BrandingConfig, 'siteId' | 'updatedAt'>
