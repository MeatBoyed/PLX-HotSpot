'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import type { ConnectionDataPoint } from '@/lib/types/dashboard.types'

export function ConnectionsChart({ data }: { data: ConnectionDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.connections), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Connections — Last 7 Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32">
          {data.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                <div
                  className="w-full bg-primary rounded-t-sm transition-all"
                  style={{ height: `${(point.connections / max) * 100}%`, minHeight: 2 }}
                  title={`${point.connections} connections`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {point.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span>{max.toLocaleString()} peak</span>
        </div>
      </CardContent>
    </Card>
  )
}
