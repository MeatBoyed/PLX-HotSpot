export interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
  siteCount: number
  status: 'active' | 'suspended' | 'inactive'
}

export interface CreateTenantInput {
  name: string
  slug: string
  description?: string
  contactEmail?: string
  contactPhone?: string
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  status?: Tenant['status']
}
