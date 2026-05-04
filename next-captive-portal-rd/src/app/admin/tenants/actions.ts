"use server";

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/infrastructure/http';
import { z } from 'zod';

const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().optional(),
});

const SiteSchema = z.object({
  id: z.string(),
  ssid: z.string(),
  name: z.string(),
  domain: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  status: z.string().optional(),
});

const TenantListSchema = z.array(TenantSchema);
const SiteListSchema = z.array(SiteSchema);

const CreateTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const CreateSiteSchema = z.object({
  tenantId: z.string().min(1),
  ssid: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

function parseArrayResponse<T>(result: unknown, schema: z.ZodType<T>, key?: string) {
  if (Array.isArray(result)) {
    return schema.parse(result);
  }

  if (key && result && typeof result === 'object' && key in result) {
    const value = (result as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      return schema.parse(value);
    }
  }

  throw new Error('Unexpected API response shape');
}

export async function listTenants() {
  const raw = await apiClient.get<unknown>('/admin/tenants');
  return parseArrayResponse(raw, TenantListSchema, 'tenants');
}

export async function listSites(tenantId: string) {
  const raw = await apiClient.get<unknown>(`/admin/tenants/${tenantId}/sites`);
  return parseArrayResponse(raw, SiteListSchema, 'sites');
}

export async function createTenant(formData: FormData) {
  const payload = CreateTenantSchema.parse({
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
  });

  await apiClient.post('/admin/tenants', payload);
  revalidatePath('/admin/tenants');
}

export async function deleteTenant(formData: FormData) {
  const tenantId = String(formData.get('tenantId') ?? '');
  if (!tenantId) {
    throw new Error('Tenant id is required');
  }

  await apiClient.delete(`/admin/tenants/${tenantId}`);
  revalidatePath('/admin/tenants');
}

export async function createSite(formData: FormData) {
  const tenantId = String(formData.get('tenantId') ?? '');
  const payload = CreateSiteSchema.parse({
    tenantId,
    ssid: String(formData.get('ssid') ?? ''),
    name: String(formData.get('name') ?? ''),
    domain: formData.get('domain') ? String(formData.get('domain')) : null,
    sortOrder: formData.get('sortOrder') ? Number(formData.get('sortOrder')) : undefined,
  });

  await apiClient.post(`/admin/tenants/${payload.tenantId}/sites`, {
    ssid: payload.ssid,
    name: payload.name,
    domain: payload.domain,
    sortOrder: payload.sortOrder,
  });
  revalidatePath('/admin/tenants');
}

export async function deleteSite(formData: FormData) {
  const siteId = String(formData.get('siteId') ?? '');
  if (!siteId) {
    throw new Error('Site id is required');
  }

  await apiClient.delete(`/admin/sites/${siteId}`);
  revalidatePath('/admin/tenants');
}
