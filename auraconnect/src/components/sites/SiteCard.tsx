import Link from 'next/link'
import { Wifi, Globe, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Site } from '@/lib/types/site.types'

interface SiteCardProps {
  site: Site
  tenantId: string
}

export function SiteCard({ site, tenantId }: SiteCardProps) {
  return (
    <Link href={`/admin/tenants/${tenantId}/sites/${site.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Wifi className="h-5 w-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{site.name}</h3>
                <p className="text-sm text-muted-foreground font-mono truncate">{site.ssid}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {site.domain && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{site.domain}</span>
              </div>
            )}
            <StatusBadge status={site.status} className="shrink-0 ml-auto" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
