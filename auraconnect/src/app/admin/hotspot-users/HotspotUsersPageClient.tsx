'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { HotspotUserTable } from '@/components/hotspot-users/HotspotUserTable'
import { useDebounce } from '@/hooks/useDebounce'
import type { HotspotUser } from '@/lib/types/hotspot-user.types'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface HotspotUsersPageClientProps {
  users: HotspotUser[]
  tenants: Tenant[]
  sites: Site[]
}

export function HotspotUsersPageClient({ users, tenants, sites }: HotspotUsersPageClientProps) {
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const debouncedSearch = useDebounce(search)

  const siteNames = Object.fromEntries(sites.map((s) => [s.id, s.name]))
  const filteredSites = tenantFilter !== 'all' ? sites.filter((s) => s.tenantId === tenantFilter) : sites

  const filtered = users.filter((u) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      if (!u.email.toLowerCase().includes(q) &&
          !`${u.firstName} ${u.lastName}`.toLowerCase().includes(q)) return false
    }
    if (tenantFilter !== 'all' && u.tenantId !== tenantFilter) return false
    if (siteFilter !== 'all' && u.siteId !== siteFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tenant</Label>
          <Select value={tenantFilter} onValueChange={(v) => { if(v) { setTenantFilter(v); setSiteFilter('all') } }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All tenants" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Site</Label>
          <Select value={siteFilter} onValueChange={(v) => v && setSiteFilter(v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All sites" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              {filteredSites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
      <HotspotUserTable users={filtered} siteNames={siteNames} />
    </div>
  )
}
