import { apiClient } from './client'
import type { components } from './schema'
import type { ApiSite } from './types'

type CreateBody = components['schemas']['CreateSiteRequest']
type UpdateBody = components['schemas']['UpdateSiteRequest']
type UpdateStatusBody = components['schemas']['UpdateSiteStatusRequest']

export const sitesApi = {
  async getByTenantId(tenantId: string): Promise<ApiSite[]> {
    const { data, response } = await apiClient.GET('/api/admin/tenants/{tenantId}/sites', {
      params: { path: { tenantId } },
    })
    if (!response.ok) throw new Error(`Failed to fetch sites for tenant ${tenantId}: ${response.status}`)
    return (data as unknown as ApiSite[]) ?? []
  },

  async getById(siteId: string): Promise<ApiSite | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch site ${siteId}: ${response.status}`)
    return (data as unknown as ApiSite) ?? null
  },

  async create(tenantId: string, body: CreateBody): Promise<ApiSite> {
    const { data, response } = await apiClient.POST('/api/admin/tenants/{tenantId}/sites', {
      params: { path: { tenantId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to create site: ${response.status}`)
    return data as unknown as ApiSite
  },

  async update(siteId: string, body: UpdateBody): Promise<void> {
    // PUT /api/admin/sites/{siteId} returns 200 with no body (content?: never in schema).
    const { error, response } = await apiClient.PUT('/api/admin/sites/{siteId}', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) {
      // openapi-fetch already consumed the response body — read the parsed error object
      const detail =
        (error as Record<string, unknown> | undefined)?.error ??
        (error as Record<string, unknown> | undefined)?.detail ??
        (error as Record<string, unknown> | undefined)?.message ??
        response.status
      throw new Error(`Failed to update site ${siteId}: ${detail}`)
    }
  },

  async updateStatus(siteId: string, body: UpdateStatusBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/status', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update site status ${siteId}: ${response.status}`)
  },

  async delete(siteId: string): Promise<void> {
    const { response } = await apiClient.DELETE('/api/admin/sites/{siteId}', {
      params: { path: { siteId } },
    })
    if (!response.ok) throw new Error(`Failed to delete site ${siteId}: ${response.status}`)
  },
}
