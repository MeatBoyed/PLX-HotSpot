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

const AdsConfigViewSchema = z
  .object({
    reviveServerUrl: z.string().nullable().optional(),
    reviveZoneId: z.string().nullable().optional(),
    reviveId: z.string().nullable().optional(),
    vastUrl: z.string().nullable().optional(),
    isEnabled: z.boolean().optional(),
  })
  .passthrough();

const AdsConfigUpdateSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  reviveServerUrl: z.string().nullable().optional(),
  reviveZoneId: z.string().nullable().optional(),
  reviveId: z.string().nullable().optional(),
  vastUrl: z.string().nullable().optional(),
  isEnabled: z.boolean(),
});

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

export async function getSiteAdsConfig(siteId: string) {
  const raw = await apiClient.get<unknown>(`/admin/sites/${siteId}/ads`);
  return AdsConfigViewSchema.parse(raw);
}

export async function updateSiteAdsConfig(formData: FormData) {
  const tenantId = String(formData.get('tenantId') ?? '');
  const siteId = String(formData.get('siteId') ?? '');
  const payload = AdsConfigUpdateSchema.parse({
    tenantId,
    siteId,
    reviveServerUrl: formData.get('reviveServerUrl') ? String(formData.get('reviveServerUrl')) : null,
    reviveZoneId: formData.get('reviveZoneId') ? String(formData.get('reviveZoneId')) : null,
    reviveId: formData.get('reviveId') ? String(formData.get('reviveId')) : null,
    vastUrl: formData.get('vastUrl') ? String(formData.get('vastUrl')) : null,
    isEnabled: formData.get('isEnabled') !== null,
  });

  await apiClient.put(`/admin/sites/${payload.siteId}/ads`, {
    reviveServerUrl: payload.reviveServerUrl,
    reviveZoneId: payload.reviveZoneId,
    reviveId: payload.reviveId,
    vastUrl: payload.vastUrl,
    isEnabled: payload.isEnabled,
  });

  revalidatePath(`/admin/tenants/${payload.tenantId}/sites/adsconfig`);
}
