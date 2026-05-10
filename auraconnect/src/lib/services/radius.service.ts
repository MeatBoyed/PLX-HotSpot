import { radiusApi } from '@/lib/infrastructure/api/radius.api'
import type { ApiRadiusConfig } from '@/lib/infrastructure/api/types'
import type { RadiusConfig, UpdateRadiusConfigInput } from '@/lib/types/radius.types'

function toRadiusConfig(api: ApiRadiusConfig): RadiusConfig {
  return {
    siteId: api.siteId ?? '',
    gatewayUrl: api.gatewayUrl,
    freeUsername: api.freeUsername,
    freePassword: api.freePassword,
    radiusDeskUrl: api.radiusDeskUrl,
    radiusDeskApiToken: api.radiusDeskApiToken,
    radiusDeskRealmId: api.radiusDeskRealmId,
    radiusDeskCloudId: api.radiusDeskCloudId,
  }
}

export const radiusService = {
  async getBySiteId(siteId: string): Promise<RadiusConfig> {
    const api = await radiusApi.getConfig(siteId)
    if (!api) return { siteId }
    return toRadiusConfig(api)
  },

  async update(siteId: string, input: UpdateRadiusConfigInput): Promise<RadiusConfig> {
    const api = await radiusApi.updateConfig(siteId, input)
    return toRadiusConfig(api)
  },
}
