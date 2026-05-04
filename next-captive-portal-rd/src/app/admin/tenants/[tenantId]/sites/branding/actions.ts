"use server";

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/infrastructure/http';
import { z } from 'zod';

const SiteSchema = z.object({
  id: z.string(),
  ssid: z.string(),
  name: z.string(),
});

const SiteListSchema = z.array(SiteSchema);

const BrandingViewSchema = z
  .object({
    id: z.string().optional(),
    ssid: z.string(),
    name: z.string(),
    brandPrimary: z.string().nullable().optional(),
    brandSecondary: z.string().nullable().optional(),
    brandAccent: z.string().nullable().optional(),
    textPrimary: z.string().nullable().optional(),
    textSecondary: z.string().nullable().optional(),
    textTertiary: z.string().nullable().optional(),
    textMuted: z.string().nullable().optional(),
    surfaceCard: z.string().nullable().optional(),
    surfaceWhite: z.string().nullable().optional(),
    surfaceBorder: z.string().nullable().optional(),
    buttonPrimary: z.string().nullable().optional(),
    buttonPrimaryHover: z.string().nullable().optional(),
    buttonPrimaryText: z.string().nullable().optional(),
    buttonSecondary: z.string().nullable().optional(),
    buttonSecondaryHover: z.string().nullable().optional(),
    buttonSecondaryText: z.string().nullable().optional(),
    heading: z.string().nullable().optional(),
    subheading: z.string().nullable().optional(),
    buttonText: z.string().nullable().optional(),
    termsLinks: z.string().nullable().optional(),
  })
  .passthrough();

const BrandingUpdateSchema = z
  .object({
    tenantId: z.string(),
    siteId: z.string(),
    brandPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
    brandSecondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    brandAccent: z.string().regex(/^#[0-9A-F]{6}$/i),
    textPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
    textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    textTertiary: z.string().regex(/^#[0-9A-F]{6}$/i),
    textMuted: z.string().regex(/^#[0-9A-F]{6}$/i),
    surfaceCard: z.string().regex(/^#[0-9A-F]{6}$/i),
    surfaceWhite: z.string().regex(/^#[0-9A-F]{6}$/i),
    surfaceBorder: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonPrimaryHover: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonPrimaryText: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonSecondary: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonSecondaryHover: z.string().regex(/^#[0-9A-F]{6}$/i),
    buttonSecondaryText: z.string().regex(/^#[0-9A-F]{6}$/i),
    heading: z.string().nullable().optional(),
    subheading: z.string().nullable().optional(),
    buttonText: z.string().nullable().optional(),
    termsLinks: z.string().nullable().optional(),
  })
  .passthrough();

function parseListResponse(raw: unknown) {
  if (Array.isArray(raw)) {
    return SiteListSchema.parse(raw);
  }

  if (raw && typeof raw === 'object' && 'sites' in raw) {
    return SiteListSchema.parse((raw as Record<string, unknown>).sites);
  }

  throw new Error('Unexpected site list response');
}

export async function listSitesForTenant(tenantId: string) {
  const raw = await apiClient.get<unknown>(`/admin/tenants/${tenantId}/sites`);
  return parseListResponse(raw);
}

export async function getSiteBranding(siteId: string) {
  const raw = await apiClient.get<unknown>(`/admin/sites/${siteId}/branding`);
  return BrandingViewSchema.parse(raw);
}

export async function updateSiteBranding(formData: FormData) {
  const payload = BrandingUpdateSchema.parse({
    tenantId: String(formData.get('tenantId') ?? ''),
    siteId: String(formData.get('siteId') ?? ''),
    brandPrimary: String(formData.get('brandPrimary') ?? '#301358'),
    brandSecondary: String(formData.get('brandSecondary') ?? '#F2F2F2'),
    brandAccent: String(formData.get('brandAccent') ?? '#FF6B35'),
    textPrimary: String(formData.get('textPrimary') ?? '#000000'),
    textSecondary: String(formData.get('textSecondary') ?? '#424242'),
    textTertiary: String(formData.get('textTertiary') ?? '#757575'),
    textMuted: String(formData.get('textMuted') ?? '#BDBDBD'),
    surfaceCard: String(formData.get('surfaceCard') ?? '#FFFFFF'),
    surfaceWhite: String(formData.get('surfaceWhite') ?? '#FFFFFF'),
    surfaceBorder: String(formData.get('surfaceBorder') ?? '#E0E0E0'),
    buttonPrimary: String(formData.get('buttonPrimary') ?? '#301358'),
    buttonPrimaryHover: String(formData.get('buttonPrimaryHover') ?? '#5B3393'),
    buttonPrimaryText: String(formData.get('buttonPrimaryText') ?? '#FFFFFF'),
    buttonSecondary: String(formData.get('buttonSecondary') ?? '#F2F2F2'),
    buttonSecondaryHover: String(formData.get('buttonSecondaryHover') ?? '#E0E0E0'),
    buttonSecondaryText: String(formData.get('buttonSecondaryText') ?? '#000000'),
    heading: formData.get('heading') ? String(formData.get('heading')) : null,
    subheading: formData.get('subheading') ? String(formData.get('subheading')) : null,
    buttonText: formData.get('buttonText') ? String(formData.get('buttonText')) : null,
    termsLinks: formData.get('termsLinks') ? String(formData.get('termsLinks')) : null,
  });

  await apiClient.put(`/admin/sites/${payload.siteId}/branding`, {
    brandPrimary: payload.brandPrimary,
    brandSecondary: payload.brandSecondary,
    brandAccent: payload.brandAccent,
    textPrimary: payload.textPrimary,
    textSecondary: payload.textSecondary,
    textTertiary: payload.textTertiary,
    textMuted: payload.textMuted,
    surfaceCard: payload.surfaceCard,
    surfaceWhite: payload.surfaceWhite,
    surfaceBorder: payload.surfaceBorder,
    buttonPrimary: payload.buttonPrimary,
    buttonPrimaryHover: payload.buttonPrimaryHover,
    buttonPrimaryText: payload.buttonPrimaryText,
    buttonSecondary: payload.buttonSecondary,
    buttonSecondaryHover: payload.buttonSecondaryHover,
    buttonSecondaryText: payload.buttonSecondaryText,
    heading: payload.heading,
    subheading: payload.subheading,
    buttonText: payload.buttonText,
    termsLinks: payload.termsLinks,
  });

  revalidatePath(`/admin/tenants/${payload.tenantId}/sites/branding`);
}
