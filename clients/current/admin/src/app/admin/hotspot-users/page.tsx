import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { HotspotUsersPageClient } from './HotspotUsersPageClient'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'

interface Props {
  searchParams: Promise<{ tenantId?: string; siteId?: string; page?: string }>
}

async function HotspotUsersContent({ searchParams }: Props) {
  const sp = await searchParams
  const tenantId = sp.tenantId && sp.tenantId !== 'all' ? sp.tenantId : undefined
  const siteId = sp.siteId && sp.siteId !== 'all' ? sp.siteId : undefined
  const page = Math.max(1, Number(sp.page ?? 1))

  const [paged, tenants, sites] = await Promise.all([
    hotspotUserService.getAll({ page, pageSize: 25, tenantId, siteId }),
    tenantService.getAll(),
    siteService.getAll(),
  ])

  return (
    <>
      <PageHeader
        title="Hotspot Users"
        description={`${paged.totalCount} registered portal users`}
      />
      <HotspotUsersPageClient
        paged={paged}
        tenants={tenants}
        sites={sites}
        currentTenantId={sp.tenantId ?? 'all'}
        currentSiteId={sp.siteId ?? 'all'}
        currentPage={page}
      />
    </>
  )
}

export default async function HotspotUsersPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <HotspotUsersContent searchParams={searchParams} />
    </Suspense>
  )
}
