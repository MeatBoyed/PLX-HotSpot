import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { TransactionsPageClient } from './TransactionsPageClient'
import { transactionService } from '@/lib/services/transaction.service'
import { siteService } from '@/lib/services/site.service'
import { tenantService } from '@/lib/services/tenant.service'

async function TransactionsContent() {
  const [transactions, sites, tenants] = await Promise.all([
    transactionService.getAll(),
    siteService.getAll(),
    tenantService.getAll(),
  ])

  return (
    <>
      <PageHeader title="Transactions" description="All wallet top-ups, bundle purchases, and adjustments" />
      <TransactionsPageClient transactions={transactions} tenants={tenants} sites={sites} />
    </>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <TransactionsContent />
    </Suspense>
  )
}
