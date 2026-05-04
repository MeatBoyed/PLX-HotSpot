'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Tenants', href: '/admin/tenants', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" />, superAdminOnly: true },
]

interface SidebarProps {
  currentTenantName?: string
  currentSiteName?: string
}

export function Sidebar({ currentTenantName, currentSiteName }: SidebarProps) {
  const pathname = usePathname()
  const { isSuperAdmin } = usePermissions()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-card border-l border-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-border h-16">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
          <Wifi className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm truncate">AuraConnect</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          if (item.superAdminOnly && !isSuperAdmin) return null
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Context footer */}
      {!collapsed && (currentTenantName || currentSiteName) && (
        <>
          <Separator />
          <div className="p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Context</p>
            {currentTenantName && (
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{currentTenantName}</span>
              </div>
            )}
            {currentSiteName && (
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{currentSiteName}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
