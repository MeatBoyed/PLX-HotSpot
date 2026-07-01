'use server'

import { tenantService } from '@/lib/services/tenant.service'
import type { CreateTenantInput, UpdateTenantInput } from '@/lib/types/tenant.types'

export async function createTenantAction(input: CreateTenantInput) {
  return tenantService.create(input)
}

export async function updateTenantAction(id: string, input: UpdateTenantInput) {
  return tenantService.update(id, input)
}

export async function deleteTenantAction(id: string) {
  return tenantService.delete(id)
}
