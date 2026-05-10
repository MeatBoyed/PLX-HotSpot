export interface RadiusConfig {
  siteId: string
  gatewayUrl?: string | null
  freeUsername?: string | null
  freePassword?: string | null
  radiusDeskUrl?: string | null
  radiusDeskApiToken?: string | null
  radiusDeskRealmId?: string | null
  radiusDeskCloudId?: string | null
}

export type UpdateRadiusConfigInput = Omit<RadiusConfig, 'siteId'>
