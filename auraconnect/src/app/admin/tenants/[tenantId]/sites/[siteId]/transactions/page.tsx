import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { SiteTransactionsClient } from './SiteTransactionsClient'
import { transactionService } from '@/lib/services/transaction.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
  searchParams: Promise<{ page?: string }>
}

async function SiteTransactionsContent({ params, searchParams }: Props) {
  const { tenantId, siteId } = await params
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const paged = await transactionService.getAll({ siteId, page, pageSize: 25 })

  return (
    <>
      <PageHeader
        title="Site Transactions"
        description={`${paged.totalCount} transaction${paged.totalCount !== 1 ? 's' : ''} at this site`}
      />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <SiteTransactionsClient
        paged={paged}
        tenantId={tenantId}
        siteId={siteId}
        currentPage={page}
      />
    </>
  )
}

export default async function SiteTransactionsPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <SiteTransactionsContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
