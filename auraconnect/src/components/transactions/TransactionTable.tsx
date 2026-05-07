'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Download, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { exportToCsv } from '@/lib/utils/export-to-csv'
import { exportToExcel } from '@/lib/utils/export-to-excel'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/types/transaction.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface TransactionTableProps {
  transactions: Transaction[]
  siteNames: Record<string, string>
  filename?: string
  tenants?: Tenant[]
  sites?: Site[]
}

const PAGE_SIZE_OPTIONS = [25, 50, 100]

const typeLabels: Record<TransactionType, string> = {
  topup: 'Top-up', purchase: 'Purchase', refund: 'Refund', adjustment: 'Adjustment',
}
const typeBadgeVariant: Record<TransactionType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  topup: 'default', purchase: 'secondary', refund: 'outline', adjustment: 'secondary',
}
const statusBadgeVariant: Record<TransactionStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  completed: 'outline', pending: 'secondary', failed: 'destructive', refunded: 'secondary',
}

export function TransactionTable({ transactions, siteNames, filename = 'transactions', tenants, sites }: TransactionTableProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tenantFilter, setTenantFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const debouncedSearch = useDebounce(search)

  const fromMs = dateFrom ? new Date(dateFrom).getTime() : null
  const toMs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null
  const resetPage = () => setPage(1)

  // Sites filtered to selected tenant
  const filteredSites = tenantFilter !== 'all' && sites
    ? sites.filter((s) => s.tenantId === tenantFilter)
    : sites

  const filtered = transactions.filter((t) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      if (!t.userEmail.toLowerCase().includes(q) && !t.userFullName.toLowerCase().includes(q)) return false
    }
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (tenantFilter !== 'all' && t.tenantId !== tenantFilter) return false
    if (siteFilter !== 'all' && t.siteId !== siteFilter) return false
    const ms = new Date(t.createdAt).getTime()
    if (fromMs !== null && ms < fromMs) return false
    if (toMs !== null && ms > toMs) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const paginated = filtered.slice(pageStart, pageStart + pageSize)

  const totalCredits = filtered.filter(t => t.amountCents > 0 && t.status === 'completed').reduce((s, t) => s + t.amountCents, 0)
  const totalDebits = filtered.filter(t => t.amountCents < 0 && t.status === 'completed').reduce((s, t) => s + Math.abs(t.amountCents), 0)

  const exportRows = filtered.map((t) => ({
    User: t.userFullName, Email: t.userEmail,
    Site: siteNames[t.siteId] ?? t.siteId,
    Type: typeLabels[t.type], Amount: formatCurrency(t.amountCents / 100),
    Status: t.status, Description: t.description,
    Date: formatDateTime(t.createdAt),
  }))

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Credits:</span>
          <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(totalCredits / 100)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Debits:</span>
          <span className="font-medium">{formatCurrency(totalDebits / 100)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search user…" value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }} />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={typeFilter} onValueChange={(v) => v && (setTypeFilter(v), resetPage())}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="topup">Top-up</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => v && (setStatusFilter(v), resetPage())}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tenant filter — only when tenants are provided */}
        {tenants && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tenant</Label>
            <Select value={tenantFilter} onValueChange={(v) => { if(v) { setTenantFilter(v); setSiteFilter('all'); resetPage() } }}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Site filter — only when sites are provided */}
        {filteredSites && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Site</Label>
            <Select value={siteFilter} onValueChange={(v) => v && (setSiteFilter(v), resetPage())}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {filteredSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date range */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input type="date" className="w-36 text-sm" value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPage() }} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" className="w-36 text-sm" value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); resetPage() }} />
        </div>

        {/* Export dropdown */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground opacity-0 select-none">Export</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportToCsv(filename, exportRows)}>
                <Download className="mr-2 h-4 w-4" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(filename, exportRows)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{t.userFullName}</p>
                    <p className="text-xs text-muted-foreground">{t.userEmail}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {siteNames[t.siteId] ?? t.siteId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant[t.type]}>{typeLabels[t.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-semibold tabular-nums',
                      t.amountCents > 0 ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                    )}>
                      {t.amountCents > 0 ? '+' : ''}{formatCurrency(t.amountCents / 100)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[t.status]}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-48 truncate">
                    {t.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(t.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => v && (setPageSize(Number(v)), resetPage())}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Page {safePage} of {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
