import { apiClient } from './client'
import type { components } from './schema'
import type { ApiTenant } from './types'

type CreateBody = components['schemas']['CreateTenantRequest']
type UpdateBody = components['schemas']['UpdateTenantRequest']

export const tenantsApi = {
  async getAll(): Promise<ApiTenant[]> {
    const { data, response } = await apiClient.GET('/api/admin/tenants')
    if (!response.ok) throw new Error(`Failed to fetch tenants: ${response.status}`)
    return (data as unknown as ApiTenant[]) ?? []
  },

  async getById(id: string): Promise<ApiTenant | null> {
    const { data, response } = await apiClient.GET('/api/admin/tenants/{id}', {
      params: { path: { id } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch tenant ${id}: ${response.status}`)
    return (data as unknown as ApiTenant) ?? null
  },

  async create(body: CreateBody): Promise<ApiTenant> {
    const { data, response } = await apiClient.POST('/api/admin/tenants', { body })
    if (!response.ok) throw new Error(`Failed to create tenant: ${response.status}`)
    return data as unknown as ApiTenant
  },

  async update(id: string, body: UpdateBody): Promise<ApiTenant> {
    const { data, response } = await apiClient.PUT('/api/admin/tenants/{id}', {
      params: { path: { id } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update tenant ${id}: ${response.status}`)
    return data as unknown as ApiTenant
  },

  async delete(id: string): Promise<void> {
    const { response } = await apiClient.DELETE('/api/admin/tenants/{id}', {
      params: { path: { id } },
    })
    if (!response.ok) throw new Error(`Failed to delete tenant ${id}: ${response.status}`)
  },
}
