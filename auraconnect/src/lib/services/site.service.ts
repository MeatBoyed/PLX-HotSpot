import { mockSites } from '@/lib/mock-data/sites'
import type { Site, CreateSiteInput, UpdateSiteInput } from '@/lib/types/site.types'

let sites = [...mockSites]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const siteService = {
  async getAll(): Promise<Site[]> {
    await delay()
    return [...sites]
  },

  async getByTenantId(tenantId: string): Promise<Site[]> {
    await delay()
    return sites.filter((s) => s.tenantId === tenantId)
  },

  async getById(id: string): Promise<Site | null> {
    await delay()
    return sites.find((s) => s.id === id) ?? null
  },

  async create(input: CreateSiteInput): Promise<Site> {
    await delay()
    const now = new Date().toISOString()
    const site: Site = {
      id: `site_${Date.now()}`,
      ...input,
      status: input.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    }
    sites = [...sites, site]
    return site
  },

  async update(id: string, input: UpdateSiteInput): Promise<Site> {
    await delay()
    const idx = sites.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error(`Site ${id} not found`)
    const updated = { ...sites[idx], ...input, updatedAt: new Date().toISOString() }
    sites = sites.map((s) => (s.id === id ? updated : s))
    return updated
  },

  async delete(id: string): Promise<void> {
    await delay()
    sites = sites.filter((s) => s.id !== id)
  },
}
