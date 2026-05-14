'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { HotspotUserTable } from '@/components/hotspot-users/HotspotUserTable'
import { useDebounce } from '@/hooks/useDebounce'
import type { HotspotUser, PagedProfiles } from '@/lib/types/hotspot-user.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface HotspotUsersPageClientProps {
  paged: PagedProfiles
  tenants: Tenant[]
  sites: Site[]
  currentTenantId: string
  currentSiteId: string
  currentPage: number
}

export function HotspotUsersPageClient({
  paged,
  tenants,
  sites,
  currentTenantId,
  currentSiteId,
  currentPage,
}: HotspotUsersPageClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const debouncedSearch = useDebounce(search)

  const filteredSites = currentTenantId !== 'all'
    ? sites.filter((s) => s.tenantId === currentTenantId)
    : sites

  // Client-side search on the current page only (API doesn't support search)
  const displayed: HotspotUser[] = debouncedSearch
    ? paged.items.filter((u) => {
        const q = debouncedSearch.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        )
      })
    : paged.items

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams()
    sp.set('tenantId', params.tenantId ?? currentTenantId)
    sp.set('siteId', params.siteId ?? currentSiteId)
    sp.set('page', params.page ?? '1')
    startTransition(() => router.push(`/admin/hotspot-users?${sp.toString()}`))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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

      <p className="text-sm text-muted-foreground">
        {paged.totalCount} user{paged.totalCount !== 1 ? 's' : ''} total
        {debouncedSearch && ` · ${displayed.length} matching search`}
      </p>

      <HotspotUserTable users={displayed} />

      {paged.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {currentPage} of {paged.totalPages}
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
