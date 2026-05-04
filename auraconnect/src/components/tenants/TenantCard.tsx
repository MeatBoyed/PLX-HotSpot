import Link from 'next/link'
import { Building2, MapPin, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Tenant } from '@/lib/types/tenant.types'

export function TenantCard({ tenant }: { tenant: Tenant }) {
  return (
    <Link href={`/admin/tenants/${tenant.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{tenant.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{tenant.contactEmail}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{tenant.siteCount} site{tenant.siteCount !== 1 ? 's' : ''}</span>
            </div>
            <StatusBadge status={tenant.status} />
          </div>

          {tenant.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{tenant.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
