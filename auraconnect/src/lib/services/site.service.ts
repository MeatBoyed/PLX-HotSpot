import { mockSites } from '@/lib/mock-data/sites'
import { sitesApi } from '@/lib/infrastructure/api/sites.api'
import type { ApiSite } from '@/lib/infrastructure/api/types'
import type { Site, SiteStatus, CreateSiteInput, UpdateSiteInput } from '@/lib/types/site.types'

const STATUS_MAP: Record<number | string, SiteStatus> = {
  0: 'active', active: 'active',
  1: 'maintenance', maintenance: 'maintenance',
  2: 'suspended', suspended: 'suspended',
  3: 'inactive', inactive: 'inactive',
}

function toSite(r: ApiSite): Site {
  return {
    id: r.id,
    tenantId: r.tenantId,
    name: r.name,
    ssid: r.ssid,
    domain: r.domain,
    sortOrder: r.sortOrder ?? undefined,
    status: STATUS_MAP[r.status] ?? 'active',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export const siteService = {
  // No top-level GET /api/admin/sites endpoint yet — returns mock data for filter dropdowns
  async getAll(): Promise<Site[]> {
    return [...mockSites]
  },

  async getByTenantId(tenantId: string): Promise<Site[]> {
    const results = await sitesApi.getByTenantId(tenantId)
    return results.map(toSite)
  },

  async getById(id: string): Promise<Site | null> {
    const result = await sitesApi.getById(id)
    return result ? toSite(result) : null
  },

  async create(input: CreateSiteInput): Promise<Site> {
    const result = await sitesApi.create(input.tenantId, {
      name: input.name,
      ssid: input.ssid,
      domain: input.domain ?? null,
      sortOrder: input.sortOrder,
    })
    return toSite(result)
  },

  async update(id: string, input: UpdateSiteInput): Promise<Site> {
    const result = await sitesApi.update(id, {
      name: input.name,
      ssid: input.ssid,
      domain: input.domain ?? null,
      sortOrder: input.sortOrder,
    })
    return toSite(result)
  },

  async updateStatus(id: string, status: number): Promise<void> {
    await sitesApi.updateStatus(id, { status })
  },

  async delete(id: string): Promise<void> {
    await sitesApi.delete(id)
  },
}
