'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'
import { TenantSiteSelector } from './TenantSiteSelector'
import type { Tenant } from '@/lib/types/tenant.types'
import type { Site } from '@/lib/types/site.types'

interface HeaderProps {
  tenants: Tenant[]
  sites: Site[]
  currentTenantId?: string
  currentSiteId?: string
}

export function Header({ tenants, sites, currentTenantId, currentSiteId }: HeaderProps) {
  const { role } = usePermissions()

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 gap-4 shrink-0">
      <TenantSiteSelector
        tenants={tenants}
        sites={sites}
        currentTenantId={currentTenantId}
        currentSiteId={currentSiteId}
      />

      <div className="flex items-center gap-2">
        <Badge variant={role === 'super_admin' ? 'default' : 'secondary'} className="text-xs hidden sm:flex">
          {role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </Badge>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
