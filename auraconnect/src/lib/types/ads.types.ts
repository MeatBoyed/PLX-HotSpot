export type AdProvider = 'google' | 'revuve' | 'custom' | 'none'
export type AdDisplayMode = 'banner' | 'interstitial' | 'both'

export interface AdsConfig {
  id: string
  siteId: string
  enabled: boolean
  provider: AdProvider
  displayMode: AdDisplayMode
  googleAdClientId?: string
  googleAdSlotId?: string
  revuvePublisherId?: string
  customAdScript?: string
  adDurationSeconds: number
  skipAfterSeconds?: number
  updatedAt: string
}

export interface UpdateAdsConfigInput extends Omit<AdsConfig, 'id' | 'siteId' | 'updatedAt'> {}
