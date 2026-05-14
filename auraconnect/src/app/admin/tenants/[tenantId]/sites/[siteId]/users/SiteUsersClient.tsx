'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { HotspotUserTable } from '@/components/hotspot-users/HotspotUserTable'
import { useDebounce } from '@/hooks/useDebounce'
import type { HotspotUser, PagedProfiles } from '@/lib/types/hotspot-user.types'

interface Props {
  paged: PagedProfiles
  tenantId: string
  siteId: string
  currentPage: number
}

export function SiteUsersClient({ paged, tenantId, siteId, currentPage }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const debouncedSearch = useDebounce(search)

  const displayed: HotspotUser[] = debouncedSearch
    ? paged.items.filter((u) => {
        const q = debouncedSearch.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        )
      })
    : paged.items

  function navigate(page: number) {
    const sp = new URLSearchParams({ page: String(page) })
    startTransition(() =>
      router.push(`/admin/tenants/${tenantId}/sites/${siteId}/users?${sp.toString()}`)
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
