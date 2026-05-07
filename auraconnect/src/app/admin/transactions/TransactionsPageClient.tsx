'use client'

import { TransactionTable } from '@/components/transactions/TransactionTable'
import type { Transaction } from '@/lib/types/transaction.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface TransactionsPageClientProps {
  transactions: Transaction[]
  tenants: Tenant[]
  sites: Site[]
}

export function TransactionsPageClient({ transactions, tenants, sites }: TransactionsPageClientProps) {
  const siteNames = Object.fromEntries(sites.map((s) => [s.id, s.name]))
  return (
    <TransactionTable
      transactions={transactions}
      siteNames={siteNames}
      tenants={tenants}
      sites={sites}
      filename={`transactions-${new Date().toISOString().split('T')[0]}`}
    />
  )
}
