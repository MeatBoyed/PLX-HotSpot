import { apiClient } from './client'
import type { components } from './schema'

type PackageResponse = components['schemas']['PackageResponse']
type CreateBody = components['schemas']['CreatePackageRequest']
type UpdateBody = components['schemas']['UpdatePackageRequest']

function extractError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const e = error as Record<string, unknown>
  const msg = e['detail'] ?? e['message'] ?? e['title']
  return typeof msg === 'string' ? msg : fallback
}

export const packagesApi = {
  async getBySiteId(siteId: string): Promise<PackageResponse[]> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/packages', {
      params: { path: { siteId } },
    })
    if (!response.ok) throw new Error(`Failed to fetch packages for site ${siteId}: ${response.status}`)
    return (data as unknown as PackageResponse[]) ?? []
  },

  async getById(siteId: string, packageId: string): Promise<PackageResponse | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/packages/{packageId}', {
      params: { path: { siteId, packageId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch package ${packageId}: ${response.status}`)
    return data as unknown as PackageResponse
  },

  async create(siteId: string, body: CreateBody): Promise<PackageResponse> {
    const { data, error, response } = await apiClient.POST('/api/admin/sites/{siteId}/packages', {
      params: { path: { siteId } },
      body,
    })
    if (response.status === 409) throw new Error("This site's RADIUS configuration is incomplete. Set the RadiusDesk Realm ID and Cloud ID in the site's RADIUS settings before creating packages.")
    if (!response.ok) throw new Error(extractError(error, `Failed to create package (${response.status})`))
    return data as unknown as PackageResponse
  },

  async update(siteId: string, packageId: string, body: UpdateBody): Promise<PackageResponse> {
    const { data, error, response } = await apiClient.PUT('/api/admin/sites/{siteId}/packages/{packageId}', {
      params: { path: { siteId, packageId } },
      body,
    })
    if (!response.ok) throw new Error(extractError(error, 'Failed to update package'))
    return data as unknown as PackageResponse
  },

  async delete(siteId: string, packageId: string): Promise<void> {
    const { response } = await apiClient.DELETE('/api/admin/sites/{siteId}/packages/{packageId}', {
      params: { path: { siteId, packageId } },
    })
    if (!response.ok) throw new Error(`Failed to delete package ${packageId}: ${response.status}`)
  },
}
