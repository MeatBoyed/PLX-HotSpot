export interface AdsConfig {
  siteId: string
  isEnabled?: boolean | null
  reviveServerUrl?: string | null
  reviveZoneId?: string | null
  reviveId?: string | null
  vastUrl?: string | null
}

export type UpdateAdsConfigInput = Omit<AdsConfig, 'siteId'>
