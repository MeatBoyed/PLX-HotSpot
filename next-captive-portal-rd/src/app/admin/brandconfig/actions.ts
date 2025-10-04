"use server";

import { z } from 'zod';
import type { BrandingConfig } from '@/lib/types';
import { databaseService, type BrandingConfigAppUpdate } from '@/lib/services/database-service';

const identitySchema = z.object({
    name: z.string().min(1).max(255).optional(),
    logo: z.string().max(255).nullable().optional(),
    logoWhite: z.string().max(255).nullable().optional(),
    connectCardBackground: z.string().max(255).nullable().optional(),
    bannerOverlay: z.string().max(255).nullable().optional(),
    favicon: z.string().max(255).nullable().optional(),
    heading: z.string().max(255).nullable().optional(),
    subheading: z.string().max(255).nullable().optional(),
    buttonText: z.string().max(255).nullable().optional(),
    termsLinks: z.string().nullable().optional(),
    splashBackground: z.string().max(255).nullable().optional(),
    splashHeading: z.string().max(255).nullable().optional(),
    authMethods: z.array(z.enum(['free', 'voucher'])).optional(),
});

const colorsSchema = z.object({
    brandPrimary: z.string().max(7).optional(),
    brandPrimaryHover: z.string().max(7).optional(),
    brandSecondary: z.string().max(7).optional(),
    brandAccent: z.string().max(7).optional(),
    textPrimary: z.string().max(7).optional(),
    textSecondary: z.string().max(7).optional(),
    textTertiary: z.string().max(7).optional(),
    textMuted: z.string().max(7).optional(),
    surfaceCard: z.string().max(7).optional(),
    surfaceWhite: z.string().max(7).optional(),
    surfaceBorder: z.string().max(7).optional(),
});

const buttonsSchema = z.object({
    buttonPrimary: z.string().max(7).optional(),
    buttonPrimaryHover: z.string().max(7).optional(),
    buttonPrimaryText: z.string().max(7).optional(),
    buttonSecondary: z.string().max(7).optional(),
    buttonSecondaryHover: z.string().max(7).optional(),
    buttonSecondaryText: z.string().max(7).optional(),
});

const adsSchema = z.object({
    adsReviveServerUrl: z.string().max(255).nullable().optional(),
    adsZoneId: z.string().max(255).nullable().optional(),
    adsReviveId: z.string().max(255).nullable().optional(),
    adsVastUrl: z.string().max(255).nullable().optional(),
});

export async function updateBrandIdentityAction(ssid: string, values: unknown): Promise<BrandingConfig> {
    const parsed = identitySchema.parse(values) as BrandingConfigAppUpdate;
    const updated = await databaseService.updateBrandingConfigApp(ssid, parsed);
    if (!updated) throw new Error('Branding config not found');
    return updated;
}

export async function updateColorsAction(ssid: string, values: unknown): Promise<BrandingConfig> {
    const parsed = colorsSchema.parse(values) as BrandingConfigAppUpdate;
    const updated = await databaseService.updateBrandingConfigApp(ssid, parsed);
    if (!updated) throw new Error('Branding config not found');
    return updated;
}

export async function updateButtonsAction(ssid: string, values: unknown): Promise<BrandingConfig> {
    const parsed = buttonsSchema.parse(values) as BrandingConfigAppUpdate;
    const updated = await databaseService.updateBrandingConfigApp(ssid, parsed);
    if (!updated) throw new Error('Branding config not found');
    return updated;
}

export async function updateAdsAction(ssid: string, values: unknown): Promise<BrandingConfig> {
    const parsed = adsSchema.parse(values) as BrandingConfigAppUpdate;
    const updated = await databaseService.updateBrandingConfigApp(ssid, parsed);
    if (!updated) throw new Error('Branding config not found');
    return updated;
}
