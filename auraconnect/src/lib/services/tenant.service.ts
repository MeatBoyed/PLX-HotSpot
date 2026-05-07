import { tenantsApi } from '@/lib/infrastructure/api/tenants.api'
import type { ApiTenant } from '@/lib/infrastructure/api/types'
import type { Tenant, CreateTenantInput, UpdateTenantInput } from '@/lib/types/tenant.types'

function mapStatus(status: number | string): Tenant['status'] {
  if (status === 1 || status === 'suspended') return 'suspended'
  if (status === 2 || status === 'inactive') return 'inactive'
  return 'active'
}

function toTenant(r: ApiTenant): Tenant {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    status: mapStatus(r.status),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const results = await tenantsApi.getAll()
    return results.map(toTenant)
  },

  async getById(id: string): Promise<Tenant | null> {
    const result = await tenantsApi.getById(id)
    return result ? toTenant(result) : null
  },

  async getByIds(ids: string[]): Promise<Tenant[]> {
    const all = await tenantsApi.getAll()
    return all.filter((r) => ids.includes(r.id)).map(toTenant)
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    const result = await tenantsApi.create({ name: input.name, slug: input.slug })
    return toTenant(result)
  },

  async update(id: string, input: UpdateTenantInput): Promise<Tenant> {
    const result = await tenantsApi.update(id, {
      name: input.name,
      slug: input.slug,
    })
    return toTenant(result)
  },

  async delete(id: string): Promise<void> {
    await tenantsApi.delete(id)
  },
}
