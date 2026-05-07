import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { HotspotUsersPageClient } from './HotspotUsersPageClient'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'

async function HotspotUsersContent() {
  const [users, tenants, sites] = await Promise.all([
    hotspotUserService.getAll(),
    tenantService.getAll(),
    siteService.getAll(),
  ])

  return (
    <>
      <PageHeader title="Hotspot Users" description={`${users.length} registered portal users across all sites`} />
      <HotspotUsersPageClient users={users} tenants={tenants} sites={sites} />
    </>
  )
}

export default function HotspotUsersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <HotspotUsersContent />
    </Suspense>
  )
}
