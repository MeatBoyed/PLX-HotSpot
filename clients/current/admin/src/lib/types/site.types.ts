export type SiteStatus = 'active' | 'maintenance' | 'suspended' | 'inactive'

export interface Site {
  id: string
  tenantId: string
  name: string
  ssid: string
  domain: string
  sortOrder?: number
  status: SiteStatus
  marketingOptIn: boolean
  radiusCalledStationIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSiteInput {
  tenantId: string
  name: string
  ssid: string
  domain: string
  sortOrder?: number
}

export interface UpdateSiteInput {
  name?: string
  ssid?: string
  domain?: string
  sortOrder?: number
  marketingOptIn?: boolean | null
  radiusCalledStationIds?: string[] | null
}
