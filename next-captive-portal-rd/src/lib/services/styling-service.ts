import { databaseService, type BrandingConfigAppUpdate } from '@/lib/services/database-service';
import type { BrandingConfig } from '@/lib/types';

/**
 * Typing for each styling section
 */
export type StylingTextual = {
  name?: string | null;
  heading?: string | null;
  subheading?: string | null;
  buttonText?: string | null;
  termsLinks?: string | null;
  splashHeading?: string | null;
  authMethods?: string[];
  marketingOptIn?: boolean;
};

export type StylingColors = {
  brandPrimary?: string;
  brandPrimaryHover?: string;
  brandSecondary?: string;
  brandAccent?: string;
  textPrimary?: string;
  textSecondary?: string;
  textTertiary?: string;
  textMuted?: string;
  surfaceCard?: string;
  surfaceWhite?: string;
  surfaceBorder?: string;
};

export type StylingButtons = {
  buttonPrimary?: string;
  buttonPrimaryHover?: string;
  buttonPrimaryText?: string;
  buttonSecondary?: string;
  buttonSecondaryHover?: string;
  buttonSecondaryText?: string;
};

export type StylingImages = {
  logo?: string | null;
  logoWhite?: string | null;
  connectCardBackground?: string | null;
  bannerOverlay?: string | null;
  favicon?: string | null;
  splashBackground?: string | null;
};

export type StylingVenue = {
  parentSsid?: string | null;
  venueLabel?: string | null;
  venueRoute?: string | null;
  sortOrder?: number;
};

export type StylingAdvertising = {
  adsReviveServerUrl?: string | null;
  adsZoneId?: string | null;
  adsReviveId?: string | null;
  adsVastUrl?: string | null;
};

/**
 * Combined styling data for all sections
 */
export type StylingConfigComplete = {
  ssid: string;
  textual: StylingTextual;
  colors: StylingColors;
  buttons: StylingButtons;
  images: StylingImages;
  venue: StylingVenue;
  advertising: StylingAdvertising;
};

/**
 * StylingService - manages all styling/branding data access
 * Acts as a facade over the database service, organizing data by logical sections
 */
export class StylingService {
  /**
   * Get complete styling configuration for an SSID
   */
  static async getComplete(ssid: string): Promise<StylingConfigComplete> {
    const branding = await databaseService.getBrandingConfig(ssid);
    if (!branding) {
      throw new Error(`Styling configuration not found for SSID: ${ssid}`);
    }

    return {
      ssid: branding.ssid,
      textual: {
        name: branding.name,
        heading: branding.heading,
        subheading: branding.subheading,
        buttonText: branding.buttonText,
        termsLinks: branding.termsLinks,
        splashHeading: branding.splashHeading,
        authMethods: branding.authMethods,
        marketingOptIn: branding.marketingOptIn,
      },
      colors: {
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
      },
      buttons: {
        buttonPrimary: branding.buttonPrimary,
        buttonPrimaryHover: branding.buttonPrimaryHover,
        buttonPrimaryText: branding.buttonPrimaryText,
        buttonSecondary: branding.buttonSecondary,
        buttonSecondaryHover: branding.buttonSecondaryHover,
        buttonSecondaryText: branding.buttonSecondaryText,
      },
      images: {
        logo: branding.logo,
        logoWhite: branding.logoWhite,
        connectCardBackground: branding.connectCardBackground,
        bannerOverlay: branding.bannerOverlay,
        favicon: branding.favicon,
        splashBackground: branding.splashBackground,
      },
      venue: {
        parentSsid: branding.parentSsid,
        venueLabel: branding.venueLabel,
        venueRoute: branding.venueRoute,
        sortOrder: branding.sortOrder,
      },
      advertising: {
        adsReviveServerUrl: branding.adsReviveServerUrl,
        adsZoneId: branding.adsZoneId,
        adsReviveId: branding.adsReviveId,
        adsVastUrl: branding.adsVastUrl,
      },
    };
  }

  /**
   * Get a specific styling section
   */
  static async getSection(
    ssid: string,
    section: 'textual' | 'colors' | 'buttons' | 'images' | 'venue' | 'advertising'
  ): Promise<StylingTextual | StylingColors | StylingButtons | StylingImages | StylingVenue | StylingAdvertising> {
    const complete = await this.getComplete(ssid);
    return complete[section];
  }

  /**
   * Update a specific styling section
   */
  static async updateSection(
    ssid: string,
    section: 'textual' | 'colors' | 'buttons' | 'images' | 'venue' | 'advertising',
    updates: any
  ): Promise<StylingConfigComplete> {
    const updatePayload: BrandingConfigAppUpdate = updates;
    const updated = await databaseService.updateBrandingConfigApp(ssid, updatePayload);
    if (!updated) throw new Error('Styling config not found');

    // Return updated complete config
    return this.getComplete(ssid);
  }

  /**
   * Update all styling sections at once
   */
  static async updateComplete(ssid: string, config: Partial<StylingConfigComplete>): Promise<StylingConfigComplete> {
    const updatePayload = {
      ...config.textual,
      ...config.colors,
      ...config.buttons,
      ...config.images,
      ...config.venue,
      ...config.advertising,
    };

    const updated = await databaseService.updateBrandingConfigApp(ssid, updatePayload as BrandingConfigAppUpdate);
    if (!updated) throw new Error('Styling config not found');

    return this.getComplete(ssid);
  }
}
