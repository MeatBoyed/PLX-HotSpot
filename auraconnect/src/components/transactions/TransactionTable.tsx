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
import { Search, TrendingUp, TrendingDown, Download, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { exportToCsv } from '@/lib/utils/export-to-csv'
import { exportToExcel } from '@/lib/utils/export-to-excel'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types/transaction.types'

interface TransactionTableProps {
  transactions: Transaction[]
  filename?: string
  /** When true, hides the search/type/status filter bar (e.g. on profile detail page) */
  compact?: boolean
}

function typeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  if (type === 'TopUp' || type === 'topup') return 'default'
  if (type === 'Purchase' || type === 'purchase') return 'secondary'
  return 'outline'
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'Completed' || status === 'completed') return 'outline'
  if (status === 'Failed' || status === 'failed') return 'destructive'
  if (status === 'Pending' || status === 'pending') return 'secondary'
  return 'secondary'
}

export function TransactionTable({ transactions, filename = 'transactions', compact = false }: TransactionTableProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const debouncedSearch = useDebounce(search)

  const fromMs = dateFrom ? new Date(dateFrom).getTime() : null
  const toMs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null

  const filtered = transactions.filter((t) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      if (!t.reference.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false
    }
    if (typeFilter !== 'all' && t.type.toLowerCase() !== typeFilter.toLowerCase()) return false
    if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    const ms = new Date(t.createdAt).getTime()
    if (fromMs !== null && ms < fromMs) return false
    if (toMs !== null && ms > toMs) return false
    return true
  })

  const totalCredits = filtered
    .filter((t) => t.amount > 0 && (t.status === 'Completed' || t.status === 'completed'))
    .reduce((s, t) => s + t.amount, 0)
  const totalDebits = filtered
    .filter((t) => t.amount < 0 && (t.status === 'Completed' || t.status === 'completed'))
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const exportRows = filtered.map((t) => ({
    Reference: t.reference,
    Type: t.type,
    Amount: formatCurrency(t.amount, t.currency),
    Status: t.status,
    Date: formatDateTime(t.createdAt),
  }))

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Credits:</span>
          <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(totalCredits)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Debits:</span>
          <span className="font-medium">{formatCurrency(Math.abs(totalDebits))}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reference…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="TopUp">Top-up</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input type="date" className="w-36 text-sm" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input type="date" className="w-36 text-sm" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)} />
          </div>
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
      )}

      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="text-sm font-mono">{t.reference}</p>
                    {t.payFastPaymentId && (
                      <p className="text-xs text-muted-foreground font-mono">PF: {t.payFastPaymentId}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant(t.type)}>{t.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-semibold tabular-nums',
                      t.amount > 0 ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                    )}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount, t.currency)}
                    </span>
                    {t.amountFee != null && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Fee: {formatCurrency(t.amountFee, t.currency)}
                        {t.amountNet != null && <> · Net: {formatCurrency(t.amountNet, t.currency)}</>}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(t.status)}>{t.status}</Badge>
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
    </div>
  )
}
