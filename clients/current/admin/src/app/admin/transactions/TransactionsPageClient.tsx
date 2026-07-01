'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import type { PagedTransactions } from '@/lib/types/transaction.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface TransactionsPageClientProps {
  paged: PagedTransactions
  tenants: Tenant[]
  sites: Site[]
  currentTenantId: string
  currentSiteId: string
  currentPage: number
}

export function TransactionsPageClient({
  paged,
  tenants,
  sites,
  currentTenantId,
  currentSiteId,
  currentPage,
}: TransactionsPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const filteredSites = currentTenantId !== 'all'
    ? sites.filter((s) => s.tenantId === currentTenantId)
    : sites

  function navigate(params: Partial<{ tenantId: string; siteId: string; page: string }>) {
    const sp = new URLSearchParams()
    sp.set('tenantId', params.tenantId ?? currentTenantId)
    sp.set('siteId', params.siteId ?? currentSiteId)
    sp.set('page', params.page ?? '1')
    startTransition(() => router.push(`/admin/transactions?${sp.toString()}`))
  }

  return (
    <div className="space-y-4">
      {/* Server-side filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tenant</Label>
          <Select
            value={currentTenantId}
            onValueChange={(v) => v && navigate({ tenantId: v, siteId: 'all', page: '1' })}
          >
            <SelectTrigger className="w-44"><SelectValue placeholder="All tenants" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Site</Label>
          <Select
            value={currentSiteId}
            onValueChange={(v) => v && navigate({ siteId: v, page: '1' })}
          >
            <SelectTrigger className="w-44"><SelectValue placeholder="All sites" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              {filteredSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TransactionTable
        transactions={paged.items}
        filename={`transactions-page-${currentPage}`}
      />

      {paged.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {paged.totalPages} · {paged.totalCount} total
          </span>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={!paged.hasPreviousPage || isPending}
            onClick={() => navigate({ page: String(currentPage - 1) })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={!paged.hasNextPage || isPending}
            onClick={() => navigate({ page: String(currentPage + 1) })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
