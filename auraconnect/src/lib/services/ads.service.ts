import { mockAdsConfigs } from '@/lib/mock-data/ads'
import type { AdsConfig, UpdateAdsConfigInput } from '@/lib/types/ads.types'

let configs = [...mockAdsConfigs]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const DEFAULT_ADS: Omit<AdsConfig, 'id' | 'siteId' | 'updatedAt'> = {
  enabled: false,
  provider: 'none',
  displayMode: 'banner',
  adDurationSeconds: 15,
}

export const adsService = {
  async getBySiteId(siteId: string): Promise<AdsConfig> {
    await delay()
    return (
      configs.find((c) => c.siteId === siteId) ?? {
        id: `ads_${siteId}`,
        siteId,
        ...DEFAULT_ADS,
        updatedAt: new Date().toISOString(),
      }
    )
  },

  async update(siteId: string, input: UpdateAdsConfigInput): Promise<AdsConfig> {
    await delay()
    const existing = configs.find((c) => c.siteId === siteId)
    const updated: AdsConfig = existing
      ? { ...existing, ...input, updatedAt: new Date().toISOString() }
      : { id: `ads_${siteId}`, siteId, ...input, updatedAt: new Date().toISOString() }
    configs = existing
      ? configs.map((c) => (c.siteId === siteId ? updated : c))
      : [...configs, updated]
    return updated
  },
}
