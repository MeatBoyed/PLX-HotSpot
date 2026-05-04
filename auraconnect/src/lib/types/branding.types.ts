export interface BrandingConfig {
  id: string
  siteId: string

  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textPrimaryColor: string
  textSecondaryColor: string
  buttonTextColor: string
  buttonHoverColor: string
  linkColor: string
  borderColor: string
  errorColor: string
  successColor: string
  warningColor: string
  headerBgColor: string
  footerBgColor: string
  inputBgColor: string

  // Images
  logoUrl: string
  backgroundImageUrl?: string
  faviconUrl?: string

  // Text content
  headingText: string
  subheadingText: string
  connectButtonText: string
  termsText: string
  termsUrl?: string
  privacyUrl?: string
  footerText?: string

  // Venue
  venueLabel: string
  venueRoute: string

  updatedAt: string
}

export interface UpdateBrandingInput extends Omit<BrandingConfig, 'id' | 'siteId' | 'updatedAt'> {}

export const DEFAULT_BRANDING: Omit<UpdateBrandingInput, never> = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  backgroundColor: '#0f172a',
  surfaceColor: '#1e293b',
  textPrimaryColor: '#f8fafc',
  textSecondaryColor: '#94a3b8',
  buttonTextColor: '#ffffff',
  buttonHoverColor: '#4f46e5',
  linkColor: '#818cf8',
  borderColor: '#334155',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  warningColor: '#f59e0b',
  headerBgColor: '#0f172a',
  footerBgColor: '#0f172a',
  inputBgColor: '#1e293b',
  logoUrl: 'https://placehold.co/200x60?text=Logo',
  backgroundImageUrl: '',
  faviconUrl: '',
  headingText: 'Welcome to Free WiFi',
  subheadingText: 'Connect to our high-speed internet to stay connected',
  connectButtonText: 'Connect Now',
  termsText: 'By connecting, you agree to our Terms & Conditions',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  footerText: 'Powered by AuraConnect',
  venueLabel: 'Venue',
  venueRoute: '/',
}
