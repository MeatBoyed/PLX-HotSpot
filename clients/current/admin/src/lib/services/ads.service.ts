import { brandingApi } from '@/lib/infrastructure/api/branding.api'
import type { ApiAdsConfig } from '@/lib/infrastructure/api/types'
import type { AdsConfig, UpdateAdsConfigInput } from '@/lib/types/ads.types'

function toAdsConfig(api: ApiAdsConfig): AdsConfig {
  return {
    siteId: api.siteId,
    isEnabled: api.isEnabled,
    reviveServerUrl: api.reviveServerUrl,
    reviveZoneId: api.reviveZoneId,
    reviveId: api.reviveId,
    vastUrl: api.vastUrl,
  }
}

export const adsService = {
  async getBySiteId(siteId: string): Promise<AdsConfig> {
    const api = await brandingApi.getAdsConfig(siteId)
    if (!api) return { siteId }
    return toAdsConfig(api)
  },

  async update(siteId: string, input: UpdateAdsConfigInput): Promise<void> {
    await brandingApi.updateAdsConfig(siteId, input)
  },
}
