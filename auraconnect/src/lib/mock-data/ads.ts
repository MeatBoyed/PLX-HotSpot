import type { AdsConfig } from '@/lib/types/ads.types'

export const mockAdsConfigs: AdsConfig[] = [
  {
    siteId: 'site_joburg_main',
    isEnabled: true,
    reviveServerUrl: 'https://ads.example.com/revive',
    reviveZoneId: '1',
    reviveId: 'pub_joburg_001',
  },
  {
    siteId: 'site_kwa_beach',
    isEnabled: true,
    vastUrl: 'https://ads.example.com/vast.xml',
  },
  {
    siteId: 'site_sandton_l1',
    isEnabled: false,
  },
]

export function getMockAdsConfigBySiteId(siteId: string): AdsConfig | undefined {
  return mockAdsConfigs.find((a) => a.siteId === siteId)
}
