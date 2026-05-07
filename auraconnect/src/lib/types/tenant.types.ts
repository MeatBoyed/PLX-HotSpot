export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'suspended' | 'inactive'
}

export interface CreateTenantInput {
  name: string
  slug: string
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  status?: Tenant['status']
}
