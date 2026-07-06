import { NextRequest, NextResponse } from 'next/server';
import { brandingService } from '@/application/services';
import type { BrandingConfig } from '@/lib/types';

type StylingSection = 'textual' | 'colors' | 'buttons' | 'images' | 'venue' | 'advertising';

const VALID_SECTIONS: StylingSection[] = ['textual', 'colors', 'buttons', 'images', 'venue', 'advertising'];

function extractSection(branding: BrandingConfig, section: StylingSection) {
  switch (section) {
    case 'textual':
      return {
        name: branding.name,
        heading: branding.heading,
        subheading: branding.subheading,
        buttonText: branding.buttonText,
        termsLinks: branding.termsLinks,
        splashHeading: branding.splashHeading,
        authMethods: branding.authMethods,
        marketingOptIn: branding.marketingOptIn,
      };
    case 'colors':
      return {
        brandPrimary: branding.brandPrimary,
        brandPrimaryHover: branding.brandPrimaryHover,
        brandSecondary: branding.brandSecondary,
        brandAccent: branding.brandAccent,
        textPrimary: branding.textPrimary,
        textSecondary: branding.textSecondary,
        textTertiary: branding.textTertiary,
        textMuted: branding.textMuted,
        surfaceCard: branding.surfaceCard,
        surfaceWhite: branding.surfaceWhite,
        surfaceBorder: branding.surfaceBorder,
      };
    case 'buttons':
      return {
        buttonPrimary: branding.buttonPrimary,
        buttonPrimaryHover: branding.buttonPrimaryHover,
        buttonPrimaryText: branding.buttonPrimaryText,
        buttonSecondary: branding.buttonSecondary,
        buttonSecondaryHover: branding.buttonSecondaryHover,
        buttonSecondaryText: branding.buttonSecondaryText,
      };
    case 'images':
      return {
        logo: branding.logo,
        logoWhite: branding.logoWhite,
        connectCardBackground: branding.connectCardBackground,
        bannerOverlay: branding.bannerOverlay,
        favicon: branding.favicon,
        splashBackground: branding.splashBackground,
      };
    case 'venue':
      return {
        parentSsid: branding.parentSsid,
        venueLabel: branding.venueLabel,
        venueRoute: branding.venueRoute,
        sortOrder: branding.sortOrder,
      };
    case 'advertising':
      return {
        adsReviveServerUrl: branding.adsReviveServerUrl,
        adsZoneId: branding.adsZoneId,
        adsReviveId: branding.adsReviveId,
        adsVastUrl: branding.adsVastUrl,
      };
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    const ssid = req.nextUrl.searchParams.get('ssid');

    if (!ssid) {
      return NextResponse.json({ error: 'Missing ssid query parameter' }, { status: 400 });
    }

    if (!VALID_SECTIONS.includes(section as StylingSection)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const branding = await brandingService.get(ssid);
    const sectionData = extractSection(branding, section as StylingSection);

    return NextResponse.json(
      { section, data: sectionData },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/styling/[section]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch styling section' },
      { status: 500 }
    );
  }
}
