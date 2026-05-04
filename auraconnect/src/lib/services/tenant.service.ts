import { mockTenants } from '@/lib/mock-data/tenants'
import type { Tenant, CreateTenantInput, UpdateTenantInput } from '@/lib/types/tenant.types'

let tenants = [...mockTenants]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    await delay()
    return [...tenants]
  },

  async getById(id: string): Promise<Tenant | null> {
    await delay()
    return tenants.find((t) => t.id === id) ?? null
  },

  async getByIds(ids: string[]): Promise<Tenant[]> {
    await delay()
    return tenants.filter((t) => ids.includes(t.id))
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    await delay()
    const now = new Date().toISOString()
    const tenant: Tenant = {
      id: `tenant_${Date.now()}`,
      ...input,
      siteCount: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    tenants = [...tenants, tenant]
    return tenant
  },

  async update(id: string, input: UpdateTenantInput): Promise<Tenant> {
    await delay()
    const idx = tenants.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error(`Tenant ${id} not found`)
    const updated = { ...tenants[idx], ...input, updatedAt: new Date().toISOString() }
    tenants = tenants.map((t) => (t.id === id ? updated : t))
    return updated
  },

  async delete(id: string): Promise<void> {
    await delay()
    tenants = tenants.filter((t) => t.id !== id)
  },
}
