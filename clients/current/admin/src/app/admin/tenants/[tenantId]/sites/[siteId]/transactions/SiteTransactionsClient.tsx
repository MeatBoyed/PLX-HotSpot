'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import type { PagedTransactions } from '@/lib/types/transaction.types'

interface Props {
  paged: PagedTransactions
  tenantId: string
  siteId: string
  currentPage: number
}

export function SiteTransactionsClient({ paged, tenantId, siteId, currentPage }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function navigate(page: number) {
    const sp = new URLSearchParams({ page: String(page) })
    startTransition(() =>
      router.push(`/admin/tenants/${tenantId}/sites/${siteId}/transactions?${sp.toString()}`)
    )
  }

  return (
    <div className="space-y-4">
      <TransactionTable
        transactions={paged.items}
        filename={`site-${siteId}-transactions-page-${currentPage}`}
      />

      {paged.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {paged.totalPages} · {paged.totalCount} total
          </span>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={!paged.hasPreviousPage || isPending}
            onClick={() => navigate(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={!paged.hasNextPage || isPending}
            onClick={() => navigate(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
