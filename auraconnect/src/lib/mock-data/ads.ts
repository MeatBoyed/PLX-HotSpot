import type { AdsConfig } from '@/lib/types/ads.types'

export const mockAdsConfigs: AdsConfig[] = [
  {
    id: 'ads_joburg_main',
    siteId: 'site_joburg_main',
    enabled: true,
    provider: 'revuve',
    displayMode: 'banner',
    revuvePublisherId: 'pub_joburg_001',
    adDurationSeconds: 15,
    skipAfterSeconds: 5,
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'ads_kwa_beach',
    siteId: 'site_kwa_beach',
    enabled: true,
    provider: 'google',
    displayMode: 'interstitial',
    googleAdClientId: 'ca-pub-1234567890',
    googleAdSlotId: '9876543210',
    adDurationSeconds: 30,
    skipAfterSeconds: 10,
    updatedAt: '2024-12-05T11:00:00Z',
  },
  {
    id: 'ads_sandton_l1',
    siteId: 'site_sandton_l1',
    enabled: false,
    provider: 'none',
    displayMode: 'banner',
    adDurationSeconds: 15,
    updatedAt: '2024-12-01T09:00:00Z',
  },
]

export function getMockAdsConfigBySiteId(siteId: string): AdsConfig | undefined {
  return mockAdsConfigs.find((a) => a.siteId === siteId)
}
