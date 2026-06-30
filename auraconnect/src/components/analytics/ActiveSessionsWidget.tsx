'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveSessionsAction } from '@/lib/actions/metrics.actions'
import type { ActiveSessions } from '@/lib/types/metrics.types'
import { formatRelativeTime } from '@/lib/utils/formatters'

const POLL_INTERVAL_MS = 30_000

export function ActiveSessionsWidget() {
  const [data, setData] = useState<ActiveSessions | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Defined inside the effect so the linter can see setState is only called
    // from timer callbacks (setTimeout/setInterval), not the effect body directly.
    async function poll() {
      try {
        const result = await getActiveSessionsAction()
        if (active) { setData(result); setError(null) }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load active sessions')
      } finally {
        if (active) setLoading(false)
      }
    }

    const initial = setTimeout(poll, 0)
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      active = false
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4 text-primary" />
            Live Active Sessions
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {data && <span>Checked {formatRelativeTime(data.checkedAt)}</span>}
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : loading && !data ? (
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : data ? (
          <div className="space-y-3">
            <div className="text-3xl font-bold tabular-nums">{data.totalActive.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">sessions across all sites right now</p>
            {data.bySite.length > 0 && (
              <div className="space-y-1.5 mt-3">
                {data.bySite
                  .sort((a, b) => b.activeCount - a.activeCount)
                  .slice(0, 8)
                  .map((s) => (
                    <div key={s.siteId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-48">{s.siteName}</span>
                      <span className="font-mono font-semibold tabular-nums ml-2">{s.activeCount}</span>
                    </div>
                  ))}
                {data.bySite.length > 8 && (
                  <p className="text-xs text-muted-foreground">+{data.bySite.length - 8} more sites</p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
