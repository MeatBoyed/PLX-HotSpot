'use client'

import { useRouter } from 'next/navigation'
import { Building2, ChevronDown, Wifi } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/hooks/usePermissions'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface TenantSiteSelectorProps {
  tenants: Tenant[]
  sites: Site[]
  currentTenantId?: string
  currentSiteId?: string
}

export function TenantSiteSelector({ tenants, sites, currentTenantId, currentSiteId }: TenantSiteSelectorProps) {
  const router = useRouter()
  const { isSuperAdmin, tenantIds } = usePermissions()

  const accessibleTenants = isSuperAdmin
    ? tenants
    : tenants.filter((t) => tenantIds.includes(t.id))

  const currentTenant = tenants.find((t) => t.id === currentTenantId)
  const currentSite = sites.find((s) => s.id === currentSiteId)

  const label = currentSite
    ? currentSite.name
    : currentTenant
    ? currentTenant.name
    : 'Select Tenant / Site'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 max-w-xs truncate">
        {currentSite ? (
          <Wifi className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-sm">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        {/* Header label — plain div, no GroupLabel needed outside a Group */}
        <div className="px-1.5 py-1.5 text-xs font-semibold text-muted-foreground">Switch context</div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {accessibleTenants.map((tenant) => {
            const tenantSites = sites.filter((s) => s.tenantId === tenant.id)
            return (
              <DropdownMenuSub key={tenant.id}>
                <DropdownMenuSubTrigger
                  onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{tenant.name}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Sites</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tenantSites.map((site) => (
                      <DropdownMenuItem
                        key={site.id}
                        onClick={() => router.push(`/admin/tenants/${tenant.id}/sites/${site.id}`)}
                        className="cursor-pointer"
                      >
                        <Wifi className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{site.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )
          })}
        </DropdownMenuGroup>

        {isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4" />
                All tenants overview
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
