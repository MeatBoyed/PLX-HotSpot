export interface RadiusConfig {
  id: string
  siteId: string
  serverHost: string
  authPort: number
  acctPort: number
  secret: string
  timeout: number
  retries: number
  nasIdentifier: string
  nasIpAddress?: string
  updatedAt: string
}

export interface UpdateRadiusConfigInput extends Omit<RadiusConfig, 'id' | 'siteId' | 'updatedAt'> {}
