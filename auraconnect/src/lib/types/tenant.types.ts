export type PortalRoutingMode = 'PerSite' | 'TenantShared'

export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'suspended' | 'inactive'
  portalRoutingMode: PortalRoutingMode
}

export interface CreateTenantInput {
  name: string
  slug: string
  portalRoutingMode?: PortalRoutingMode
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  status?: Tenant['status']
}
