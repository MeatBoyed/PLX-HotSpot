'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Tab {
  label: string
  href: string
  segment: string
}

interface SiteConfigurationTabsProps {
  tenantId: string
  siteId: string
}

export function SiteConfigurationTabs({ tenantId, siteId }: SiteConfigurationTabsProps) {
  const pathname = usePathname()
  const base = `/admin/tenants/${tenantId}/sites/${siteId}`

  const tabs: Tab[] = [
    { label: 'Overview', href: base, segment: '' },
    { label: 'Branding', href: `${base}/branding`, segment: 'branding' },
    { label: 'Ads', href: `${base}/ads`, segment: 'ads' },
    { label: 'Packages', href: `${base}/packages`, segment: 'packages' },
    { label: 'RADIUS', href: `${base}/radius`, segment: 'radius' },
    { label: 'Marketing', href: `${base}/marketing`, segment: 'marketing' },
  ]

  return (
    <nav className="flex border-b border-border gap-1 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.segment === ''
          ? pathname === base
          : pathname.startsWith(`${base}/${tab.segment}`)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
