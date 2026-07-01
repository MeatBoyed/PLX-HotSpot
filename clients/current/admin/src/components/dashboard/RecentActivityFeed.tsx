import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Wifi, ShoppingCart, UserPlus, Settings } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { ActivityEntry } from '@/lib/types/dashboard.types'

const iconMap = {
  connection: <Wifi className="h-4 w-4 text-blue-500" />,
  package_purchase: <ShoppingCart className="h-4 w-4 text-green-500" />,
  user_signup: <UserPlus className="h-4 w-4 text-purple-500" />,
  config_change: <Settings className="h-4 w-4 text-orange-500" />,
}

export function RecentActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{iconMap[entry.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{entry.message}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
