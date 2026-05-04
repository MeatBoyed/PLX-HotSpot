import { auth, currentUser } from '@clerk/nextjs/server'
import type { UserMetadata, UserRole } from '@/lib/types/user.types'

// Mock metadata map — in production this comes from Clerk publicMetadata
const MOCK_METADATA: Record<string, UserMetadata> = {
  'charles@mbvit.co.za': { role: 'super_admin', tenantIds: [] },
  'super@auraconnect.com': { role: 'super_admin', tenantIds: [] },
  'admin@joburg-theatre.co.za': { role: 'admin', tenantIds: ['tenant_joburg'] },
  'admin@kwamaimai.co.za': { role: 'admin', tenantIds: ['tenant_kwamaimai'] },
  'tech@sandtoncity.com': { role: 'admin', tenantIds: ['tenant_sandton'] },
  'regional@auraconnect.com': { role: 'admin', tenantIds: ['tenant_joburg', 'tenant_kwamaimai'] },
}

export async function getCurrentUserMetadata(): Promise<UserMetadata> {
  const user = await currentUser()
  if (!user) return { role: 'admin', tenantIds: [] }

  // Check Clerk publicMetadata first (real production path)
  const clerkMeta = user.publicMetadata as Partial<UserMetadata>
  if (clerkMeta?.role) {
    return {
      role: clerkMeta.role,
      tenantIds: clerkMeta.tenantIds ?? [],
    }
  }

  // Fallback to mock data during development
  const email = user.emailAddresses?.[0]?.emailAddress ?? ''
  return MOCK_METADATA[email] ?? { role: 'admin', tenantIds: [] }
}

export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  return { userId }
}

export async function isSuperAdmin(): Promise<boolean> {
  const meta = await getCurrentUserMetadata()
  return meta.role === 'super_admin'
}

export async function canAccessTenant(tenantId: string): Promise<boolean> {
  const meta = await getCurrentUserMetadata()
  if (meta.role === 'super_admin') return true
  return meta.tenantIds.includes(tenantId)
}
