export type SiteStatus = 'active' | 'maintenance' | 'suspended' | 'inactive'

export interface Site {
  id: string
  tenantId: string
  name: string
  ssid: string
  domain?: string | null
  sortOrder?: number
  status: SiteStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSiteInput {
  tenantId: string
  name: string
  ssid: string
  domain?: string | null
  sortOrder?: number
}

export interface UpdateSiteInput {
  name?: string
  ssid?: string
  domain?: string | null
  sortOrder?: number
}
