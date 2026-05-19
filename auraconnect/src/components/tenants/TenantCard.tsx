import Link from 'next/link'
import { Building2, ChevronRight, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Tenant } from '@/lib/types/tenant.types'

interface TenantCardProps {
  tenant: Tenant
  onEdit?: () => void
}

export function TenantCard({ tenant, onEdit }: TenantCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors group relative">
      <Link href={`/admin/tenants/${tenant.id}`} className="block">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{tenant.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{tenant.slug}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
          </div>
          <div className="mt-4">
            <StatusBadge status={tenant.status} />
          </div>
        </CardContent>
      </Link>
      {onEdit && (
        <Button
          size="icon" variant="ghost"
          className="absolute top-3 right-8 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.preventDefault(); onEdit() }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </Card>
  )
}
