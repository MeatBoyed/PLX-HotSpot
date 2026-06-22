import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { HealthSeverity } from '@/lib/utils/mikrotik-status'

export function HealthBadge({ label, severity }: { label: string; severity: HealthSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        severity === 'ok'
          ? 'bg-green-500/15 text-green-600 border-green-500/20'
          : 'bg-red-500/15 text-red-600 border-red-500/20'
      )}
    >
      {label}
    </Badge>
  )
}
