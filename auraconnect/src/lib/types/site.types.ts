export type SiteStatus = 'active' | 'maintenance' | 'suspended' | 'inactive'

export interface Site {
  id: string
  tenantId: string
  name: string
  ssid: string
  description?: string
  address?: string
  status: SiteStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSiteInput {
  tenantId: string
  name: string
  ssid: string
  description?: string
  address?: string
  status?: SiteStatus
}

export interface UpdateSiteInput extends Partial<Omit<CreateSiteInput, 'tenantId'>> {}
