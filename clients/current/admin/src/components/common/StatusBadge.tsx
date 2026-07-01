import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'active' | 'inactive' | 'suspended' | 'maintenance' | 'pending'

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
  suspended: { label: 'Suspended', className: 'bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  maintenance: { label: 'Maintenance', className: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15' },
  pending: { label: 'Pending', className: 'bg-blue-500/15 text-blue-600 border-blue-500/20 hover:bg-blue-500/15' },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.inactive
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
