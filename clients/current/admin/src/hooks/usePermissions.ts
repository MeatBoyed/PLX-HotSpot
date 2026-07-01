'use client'

import { useUser } from '@clerk/nextjs'
import type { UserMetadata } from '@/lib/types/user.types'

const MOCK_METADATA: Record<string, UserMetadata> = {
  'charles@mbvit.co.za': { role: 'super_admin', tenantIds: [] },
  'super@auraconnect.com': { role: 'super_admin', tenantIds: [] },
  'admin@joburg-theatre.co.za': { role: 'admin', tenantIds: ['tenant_joburg'] },
  'admin@kwamaimai.co.za': { role: 'admin', tenantIds: ['tenant_kwamaimai'] },
  'tech@sandtoncity.com': { role: 'admin', tenantIds: ['tenant_sandton'] },
  'regional@auraconnect.com': { role: 'admin', tenantIds: ['tenant_joburg', 'tenant_kwamaimai'] },
}

export function usePermissions() {
  const { user, isLoaded } = useUser()

  const clerkMeta = user?.publicMetadata as Partial<UserMetadata> | undefined
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  const meta: UserMetadata =
    clerkMeta?.role
      ? { role: clerkMeta.role, tenantIds: clerkMeta.tenantIds ?? [] }
      : MOCK_METADATA[email] ?? { role: 'admin', tenantIds: [] }

  console.log("Current User: ", user)
  console.log("Derived Metadata: ", meta)

  return {
    isLoaded,
    role: meta.role,
    tenantIds: meta.tenantIds,
    isSuperAdmin: meta.role === 'super_admin',
    canAccessTenant: (tenantId: string) =>
      meta.role === 'super_admin' || meta.tenantIds.includes(tenantId),
    canManageUsers: meta.role === 'super_admin',
  }
}
