import type { BrandingConfig } from '@/lib/types/branding.types'

export const mockBranding: BrandingConfig[] = [
  {
    siteId: 'site_joburg_main',
    brandPrimary: '#c8a96e',
    brandSecondary: '#1a1a2e',
    brandAccent: '#e8c547',
    textPrimary: '#f5f0e8',
    textSecondary: '#a89070',
    surfaceCard: '#1a1a2e',
    surfaceBorder: '#2a2a3e',
    buttonPrimary: '#c8a96e',
    buttonPrimaryHover: '#b8994e',
    buttonPrimaryText: '#0d0d1a',
    logoUrl: 'https://placehold.co/200x60/c8a96e/0d0d1a?text=Joburg+Theatre',
    displayName: 'Joburg Theatre',
    heading: 'Welcome to Joburg Theatre',
    subheading: 'Stay connected during your performance experience',
    buttonText: 'Connect to WiFi',
    termsLinks: 'By connecting, you agree to our Terms & Conditions',
    venueLabel: 'Joburg Theatre',
    venueRoute: '/joburg-theatre',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    siteId: 'site_joburg_cafe',
    brandPrimary: '#c8a96e',
    brandSecondary: '#1a1a2e',
    brandAccent: '#e8c547',
    textPrimary: '#f5f0e8',
    textSecondary: '#a89070',
    surfaceCard: '#1a1a2e',
    surfaceBorder: '#2a2a3e',
    buttonPrimary: '#c8a96e',
    buttonPrimaryHover: '#b8994e',
    buttonPrimaryText: '#0d0d1a',
    logoUrl: 'https://placehold.co/200x60/c8a96e/0d0d1a?text=JT+Cafe',
    displayName: 'Joburg Theatre Café',
    heading: 'Welcome to Joburg Theatre Café',
    subheading: 'Enjoy complimentary WiFi while you dine',
    buttonText: 'Connect Now',
    termsLinks: 'By connecting, you agree to our Terms & Conditions',
    venueLabel: 'Joburg Theatre Café',
    venueRoute: '/joburg-theatre',
    updatedAt: '2024-11-15T09:30:00Z',
  },
]

export function getMockBrandingBySiteId(siteId: string): BrandingConfig | undefined {
  return mockBranding.find((b) => b.siteId === siteId)
}
