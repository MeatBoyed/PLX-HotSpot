import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GatewayLoginOutcome } from '@/lib/types/gateway-session.types'

export function OutcomeBadge({ outcome }: { outcome: GatewayLoginOutcome }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        outcome === 'Success' && 'bg-green-500/15 text-green-600 border-green-500/20',
        outcome === 'Failed' && 'bg-red-500/15 text-red-600 border-red-500/20',
        outcome === 'Pending' && 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
      )}
    >
      {outcome}
    </Badge>
  )
}
