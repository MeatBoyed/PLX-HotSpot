import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { TransactionsPageClient } from './TransactionsPageClient'
import { transactionService } from '@/lib/services/transaction.service'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'

interface Props {
  searchParams: Promise<{ tenantId?: string; siteId?: string; page?: string }>
}

async function TransactionsContent({ searchParams }: Props) {
  const sp = await searchParams
  const tenantId = sp.tenantId && sp.tenantId !== 'all' ? sp.tenantId : undefined
  const siteId = sp.siteId && sp.siteId !== 'all' ? sp.siteId : undefined
  const page = Math.max(1, Number(sp.page ?? 1))

  const [paged, tenants, sites] = await Promise.all([
    transactionService.getAll({ page, pageSize: 50, tenantId, siteId }),
    tenantService.getAll(),
    siteService.getAll(),
  ])

  return (
    <>
      <PageHeader
        title="Transactions"
        description={`${paged.totalCount} wallet top-ups, purchases, and adjustments`}
      />
      <TransactionsPageClient
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

export default async function TransactionsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  )
}
