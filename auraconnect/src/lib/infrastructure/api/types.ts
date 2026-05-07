// Supplementary response types for GET endpoints not yet documented in the OpenAPI spec.
// Once the .NET API adds response schemas, regenerate schema.d.ts and remove these casts.

export interface ApiTenant {
  id: string
  name: string
  slug: string
  description?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  /** 0 = active | 1 = suspended | 2 = inactive */
  status: number
  siteCount?: number | null
  createdAt: string
  updatedAt: string
}

export interface ApiSite {
  id: string
  tenantId: string
  name: string
  ssid: string
  domain?: string | null
  sortOrder?: number | null
  /** 0 = active | 1 = maintenance | 2 = suspended | 3 = inactive */
  status: number
  authMethods?: string[] | null
  marketingOptIn?: boolean | null
  createdAt: string
  updatedAt: string
}

export interface ApiBranding {
  siteId: string
  // colours
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
  // images
  logoUrl?: string | null
  logoWhiteUrl?: string | null
  connectCardBgUrl?: string | null
  bannerOverlayUrl?: string | null
  faviconUrl?: string | null
  splashBgUrl?: string | null
  // content
  displayName?: string | null
  heading?: string | null
  subheading?: string | null
  splashHeading?: string | null
  buttonText?: string | null
  termsLinks?: string | null
  venueLabel?: string | null
  venueRoute?: string | null
  sortOrder?: number | null
}

export interface ApiAdsConfig {
  siteId: string
  reviveServerUrl?: string | null
  reviveZoneId?: string | null
  reviveId?: string | null
  vastUrl?: string | null
  isEnabled?: boolean | null
}

/**
 * Maps to the BrandingImageType enum on the API.
 * Integer values must match the server-side enum order.
 */
export enum BrandingImageType {
  Logo = 0,
  LogoWhite = 1,
  ConnectCardBg = 2,
  BannerOverlay = 3,
  Favicon = 4,
  SplashBg = 5,
}
