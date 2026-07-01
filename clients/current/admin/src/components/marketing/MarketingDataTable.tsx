'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Download, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/formatters'
import { exportToCsv } from '@/lib/utils/export-to-csv'
import { exportToExcel } from '@/lib/utils/export-to-excel'
import { useDebounce } from '@/hooks/useDebounce'
import type { MarketingEntry } from '@/lib/types/marketing.types'

interface MarketingDataTableProps {
  entries: MarketingEntry[]
  siteSsid: string
}

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export function MarketingDataTable({ entries, siteSsid }: MarketingDataTableProps) {
  const [search, setSearch] = useState('')
  const [unsubFilter, setUnsubFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const debouncedSearch = useDebounce(search)

  const fromMs = dateFrom ? new Date(dateFrom).getTime() : null
  const toMs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null

  const filtered = entries.filter((e) => {
    if (debouncedSearch && !e.email.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
    if (unsubFilter === 'subscribed' && e.unsubscribed) return false
    if (unsubFilter === 'unsubscribed' && !e.unsubscribed) return false
    const createdMs = new Date(e.createdAt).getTime()
    if (fromMs !== null && createdMs < fromMs) return false
    if (toMs !== null && createdMs > toMs) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const paginated = filtered.slice(pageStart, pageStart + pageSize)

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  const exportRows = filtered.map((e) => ({
    Email: e.email,
    Agreed: e.agreed ? 'Yes' : 'No',
    'IP Address': e.ipAddress,
    'Created At': formatDateTime(e.createdAt),
    Unsubscribed: e.unsubscribed ? 'Yes' : 'No',
    'Unsubscribed At': e.unsubscribedAt ? formatDateTime(e.unsubscribedAt) : '',
  }))

  const filename = `${siteSsid}-marketing-${new Date().toISOString().split('T')[0]}`

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <Select value={unsubFilter} onValueChange={(v) => v && handleFilterChange(setUnsubFilter)(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              className="w-36 text-sm"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              className="w-36 text-sm"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv(filename, exportRows)}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(filename, exportRows)}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        {filtered.length > 0 && (
          <span className="ml-1">
            — showing {pageStart + 1}–{Math.min(pageStart + pageSize, filtered.length)}
          </span>
        )}
      </p>

      {/* Table */}
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Agreed</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium text-sm">{entry.email}</TableCell>
                  <TableCell>
                    <Badge variant={entry.agreed ? 'default' : 'secondary'}>
                      {entry.agreed ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{entry.ipAddress}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={entry.unsubscribed ? 'destructive' : 'outline'}>
                      {entry.unsubscribed ? 'Unsubscribed' : 'Subscribed'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => v && (setPageSize(Number(v)), setPage(1))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
