import { apiClient } from './client'
import type { components } from './schema'
import type { ApiRadiusConfig } from './types'

type UpdateRadiusBody = components['schemas']['UpdateRadiusConfigRequest']

export const radiusApi = {
  async getConfig(siteId: string): Promise<ApiRadiusConfig | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/radius', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch radius config for site ${siteId}: ${response.status}`)
    return (data as unknown as ApiRadiusConfig) ?? null
  },

  async updateConfig(siteId: string, body: UpdateRadiusBody): Promise<ApiRadiusConfig> {
    const { data, response } = await apiClient.PUT('/api/admin/sites/{siteId}/radius', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update radius config for site ${siteId}: ${response.status} — ${text}`)
    }
    return data as unknown as ApiRadiusConfig
  },
}
