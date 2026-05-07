import type { Tenant } from '@/lib/types/tenant.types'

export const mockTenants: Tenant[] = [
  { id: 'tenant_joburg', name: 'Joburg Theatre', slug: 'joburg-theatre',
    status: 'active', createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-11-20T10:30:00Z' },
  { id: 'tenant_kwamaimai', name: 'Kwamaimai Beach', slug: 'kwamaimai-beach',
    status: 'active', createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-12-01T14:15:00Z' },
  { id: 'tenant_sandton', name: 'Sandton City Mall', slug: 'sandton-city',
    status: 'active', createdAt: '2024-03-05T07:30:00Z', updatedAt: '2024-12-10T16:45:00Z' },
  { id: 'tenant_pta_zoo', name: 'Pretoria National Zoo', slug: 'pretoria-zoo',
    status: 'active', createdAt: '2024-04-20T11:00:00Z', updatedAt: '2024-10-15T09:00:00Z' },
]
