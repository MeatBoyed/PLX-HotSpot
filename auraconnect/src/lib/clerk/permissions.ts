import type { UserMetadata } from '@/lib/types/user.types'

export function canAccessTenantSync(meta: UserMetadata, tenantId: string): boolean {
  if (meta.role === 'super_admin') return true
  return meta.tenantIds.includes(tenantId)
}

export function canManageUsers(meta: UserMetadata): boolean {
  return meta.role === 'super_admin'
}

export function getAccessibleTenantIds(meta: UserMetadata, allTenantIds: string[]): string[] {
  if (meta.role === 'super_admin') return allTenantIds
  return meta.tenantIds
}
