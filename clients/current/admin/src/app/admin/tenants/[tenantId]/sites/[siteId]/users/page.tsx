import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { SiteUsersClient } from './SiteUsersClient'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
  searchParams: Promise<{ page?: string }>
}

async function SiteUsersContent({ params, searchParams }: Props) {
  const { tenantId, siteId } = await params
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const paged = await hotspotUserService.getAll({ siteId, page, pageSize: 25 })

  return (
    <>
      <PageHeader
        title="Site Users"
        description={`${paged.totalCount} user${paged.totalCount !== 1 ? 's' : ''} registered at this site`}
      />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <SiteUsersClient
        paged={paged}
        tenantId={tenantId}
        siteId={siteId}
        currentPage={page}
      />
    </>
  )
}

export default async function SiteUsersPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <SiteUsersContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
