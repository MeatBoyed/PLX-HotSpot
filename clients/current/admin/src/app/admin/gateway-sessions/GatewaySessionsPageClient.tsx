'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GatewaySessionTable } from '@/components/gateway-sessions/GatewaySessionTable'
import { cn } from '@/lib/utils'
import type { PagedGatewaySessions, GatewayLoginOutcome } from '@/lib/types/gateway-session.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface Props {
  paged: PagedGatewaySessions
  tenants: Tenant[]
  sites: Site[]
  currentTenantId: string
  currentSiteId: string
  currentOutcome: GatewayLoginOutcome | 'all'
  currentMac: string
  currentFrom: string
  currentTo: string
  currentPage: number
}

const OUTCOMES: (GatewayLoginOutcome | 'all')[] = ['all', 'Pending', 'Success', 'Failed']

export function GatewaySessionsPageClient({
  paged,
  tenants,
  sites,
  currentTenantId,
  currentSiteId,
  currentOutcome,
  currentMac,
  currentFrom,
  currentTo,
  currentPage,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mac, setMac] = useState(currentMac)
  const [from, setFrom] = useState(currentFrom)
  const [to, setTo] = useState(currentTo)

  const filteredSites = currentTenantId !== 'all'
    ? sites.filter((s) => s.tenantId === currentTenantId)
    : sites

  const siteNameById = Object.fromEntries(sites.map((s) => [s.id, s.name]))

  function navigate(overrides: Partial<{
    tenantId: string
    siteId: string
    outcome: string
    mac: string
    from: string
    to: string
    page: string
  }>) {
    const sp = new URLSearchParams()
    sp.set('tenantId', overrides.tenantId ?? currentTenantId)
    sp.set('siteId', overrides.siteId ?? currentSiteId)
    sp.set('outcome', overrides.outcome ?? currentOutcome)
    sp.set('mac', overrides.mac ?? mac)
    sp.set('from', overrides.from ?? from)
    sp.set('to', overrides.to ?? to)
    sp.set('page', overrides.page ?? '1')
    startTransition(() => router.push(`/admin/gateway-sessions?${sp.toString()}`))
  }

  function applyTextFilters() {
    navigate({ mac, from, to, page: '1' })
  }

  function clearFilters() {
    setMac('')
    setFrom('')
    setTo('')
    startTransition(() => router.push('/admin/gateway-sessions'))
  }

  const hasFilters = currentTenantId !== 'all' || currentSiteId !== 'all' || currentOutcome !== 'all'
    || !!currentMac || !!currentFrom || !!currentTo

  return (
    <div className="space-y-4">
      {/* Outcome chips */}
      <div className="flex flex-wrap gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o}
            onClick={() => navigate({ outcome: o, page: '1' })}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              currentOutcome === o
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            )}
          >
            {o === 'all' ? 'All' : o}
          </button>
        ))}
      </div>

      {/* Filters */}
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
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">MAC address</Label>
          <Input
            className="w-40 font-mono text-sm"
            placeholder="aa:bb:cc:dd:ee:ff"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyTextFilters()}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input type="date" className="w-36 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" className="w-36 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={applyTextFilters} disabled={isPending}>
          <Search className="h-3.5 w-3.5 mr-1.5" /> Search
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      <GatewaySessionTable sessions={paged.items} siteNameById={siteNameById} />

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
