'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart2, CalendarRange, AlertTriangle, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ActiveSessionsWidget } from '@/components/analytics/ActiveSessionsWidget'
import { updateSiteAction } from '@/lib/actions/sites.actions'
import { toast } from 'sonner'
import type { KpiSummary, UsageTrend, SiteLeaderboard, LoginHealth, UnattributedStations } from '@/lib/types/metrics.types'
import type { Site } from '@/lib/types/site.types'

interface Props {
  from: string
  to: string
  kpi: KpiSummary | null
  trend: UsageTrend | null
  leaderboard: SiteLeaderboard | null
  loginHealth: LoginHealth | null
  unattributed: UnattributedStations | null
  allSites: Site[]
  errors: Record<string, string | null>
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576)    return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1_024)        return `${(bytes / 1_024).toFixed(1)} KB`
  return `${bytes} B`
}

// ── Date Range Picker ────────────────────────────────────────────────────────

function DateRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [localFrom, setLocalFrom] = useState(from)
  const [localTo, setLocalTo]     = useState(to)

  function apply(f: string, t: string) {
    setLocalFrom(f)
    setLocalTo(t)
    startTransition(() => {
      router.push(`/admin/analytics?from=${f}&to=${t}`)
    })
  }

  function quickPick(days: number) {
    const t = new Date()
    const f = new Date(t)
    f.setDate(f.getDate() - days)
    apply(f.toISOString().slice(0, 10), t.toISOString().slice(0, 10))
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>
        <Button size="sm" className="h-8" onClick={() => apply(localFrom, localTo)}>
          Apply
        </Button>
      </div>
      <div className="flex gap-1.5">
        {([7, 30, 90] as const).map((d) => (
          <Button key={d} variant="outline" size="sm" className="h-8 text-xs" onClick={() => quickPick(d)}>
            {d}d
          </Button>
        ))}
      </div>
    </div>
  )
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────

function KpiCards({ kpi }: { kpi: KpiSummary | null }) {
  if (!kpi) return null
  const cards = [
    { label: 'Total Data', value: `${kpi.totalDataGb.toFixed(2)} GB`, sub: 'downloaded + uploaded' },
    { label: 'Total Sessions', value: kpi.totalSessions.toLocaleString(), sub: 'RADIUS sessions' },
    { label: 'Unique Users', value: kpi.uniqueUsers.toLocaleString(), sub: 'distinct MACs' },
    { label: 'New Users', value: kpi.newUsers.toLocaleString(), sub: `${kpi.returningUsers.toLocaleString()} returning` },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            <p className="text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Usage Trend Chart ─────────────────────────────────────────────────────────

function UsageTrendChart({ trend }: { trend: UsageTrend | null }) {
  if (!trend || trend.points.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Usage Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No data for this period</p>
        </CardContent>
      </Card>
    )
  }

  const maxBytes = Math.max(...trend.points.map((p) => p.bytesIn + p.bytesOut), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Usage Trend
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="h-3 w-3 text-blue-500" /> In
            </span>
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" /> Out
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {trend.points.map((p) => {
            const total    = p.bytesIn + p.bytesOut
            const totalPct = (total / maxBytes) * 100
            const inPct    = total > 0 ? (p.bytesIn / total) * 100 : 50
            return (
              <div
                key={p.date}
                className="flex-1 flex flex-col items-center gap-1 min-w-0"
                title={`${p.date}\nIn: ${formatBytes(p.bytesIn)}\nOut: ${formatBytes(p.bytesOut)}\nSessions: ${p.sessions}`}
              >
                <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-sm overflow-hidden flex flex-col-reverse"
                    style={{ height: `${totalPct}%`, minHeight: total > 0 ? 2 : 0 }}
                  >
                    <div className="bg-blue-500" style={{ height: `${inPct}%` }} />
                    <div className="bg-green-500 flex-1" />
                  </div>
                </div>
                {trend.points.length <= 14 && (
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {p.date.slice(5)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span>{formatBytes(maxBytes)} peak</span>
        </div>
        {trend.unattributedBytes > 0 && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 dark:text-amber-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{formatBytes(trend.unattributedBytes)} of data could not be attributed to any site — check Unattributed Stations below.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Site Leaderboard ──────────────────────────────────────────────────────────

function SiteLeaderboardCard({ leaderboard }: { leaderboard: SiteLeaderboard | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const currentMetric = searchParams.get('metric') ?? 'data'

  function switchMetric(m: 'data' | 'sessions') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('metric', m)
    startTransition(() => router.push(`/admin/analytics?${params.toString()}`))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Site Leaderboard</CardTitle>
          <div className="flex gap-1">
            {(['data', 'sessions'] as const).map((m) => (
              <Button
                key={m}
                variant={currentMetric === m ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => switchMetric(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!leaderboard || leaderboard.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No data for this period</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.entries.map((entry) => (
              <div key={entry.siteId} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-right font-mono">{entry.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{entry.siteName}</div>
                </div>
                <span className="text-sm font-mono font-semibold tabular-nums shrink-0">
                  {leaderboard.metric === 'data'
                    ? `${entry.value.toFixed(1)} GB`
                    : entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Login Health ──────────────────────────────────────────────────────────────

function LoginHealthCard({ loginHealth }: { loginHealth: LoginHealth | null }) {
  if (!loginHealth) return null

  const successRate = loginHealth.totalAttempts > 0
    ? Math.round((loginHealth.successCount / loginHealth.totalAttempts) * 100)
    : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Login Health</CardTitle>
        <CardDescription>Gateway login outcomes for the selected period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-semibold tabular-nums">{loginHealth.successCount.toLocaleString()}</span>
            <span className="text-muted-foreground">succeeded</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="font-semibold tabular-nums">{loginHealth.failureCount.toLocaleString()}</span>
            <span className="text-muted-foreground">failed</span>
          </div>
        </div>

        {loginHealth.totalAttempts > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Success rate</span>
              <span>{successRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        )}

        {loginHealth.failuresByReason.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Failure breakdown</p>
              {loginHealth.failuresByReason
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <div key={r.reason} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-mono text-xs truncate max-w-48">{r.reason}</span>
                    <Badge variant="destructive" className="text-xs tabular-nums">{r.count}</Badge>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Unattributed Stations ─────────────────────────────────────────────────────

function UnattributedStationsTable({ data, allSites }: { data: UnattributedStations | null; allSites: Site[] }) {
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [saving, setSaving] = useState(false)

  if (!data || data.entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Unattributed Stations</CardTitle>
          <CardDescription>RADIUS stations that could not be matched to any site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            All stations are attributed — no unmatched RADIUS data for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  async function handleAddToSite(calledStationId: string) {
    if (!selectedSiteId) return
    const site = allSites.find((s) => s.id === selectedSiteId)
    if (!site) return

    setSaving(true)
    try {
      const updated = [...site.radiusCalledStationIds, calledStationId]
      await updateSiteAction(site.id, { radiusCalledStationIds: updated })
      toast.success(`Added "${calledStationId}" to ${site.name}`)
      setAddingFor(null)
      setSelectedSiteId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update site')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Unattributed Stations</CardTitle>
        <CardDescription>
          RADIUS <code className="text-xs bg-muted px-1 rounded">calledstationid</code> values that don&apos;t match any site — use &quot;Add to site&quot; to fix them
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Station ID</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Sessions</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Sample Usernames</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Last Seen</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <>
                  <tr key={entry.calledStationId} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{entry.calledStationId}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{entry.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {entry.sampleUsernames.slice(0, 3).map((u) => (
                          <span key={u} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{u}</span>
                        ))}
                        {entry.sampleUsernames.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{entry.sampleUsernames.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{entry.lastSeen.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setAddingFor(entry.calledStationId)
                          setSelectedSiteId('')
                        }}
                      >
                        Add to site →
                      </Button>
                    </td>
                  </tr>
                  {addingFor === entry.calledStationId && (
                    <tr key={`${entry.calledStationId}-dialog`} className="bg-muted/30 border-b">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-xs text-muted-foreground">Select which site owns this station ID:</span>
                          <select
                            className="border rounded px-2 py-1 text-sm bg-background"
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                          >
                            <option value="">— choose site —</option>
                            {allSites.map((s) => (
                              <option key={s.id} value={s.id}>{s.name} ({s.ssid})</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            disabled={!selectedSiteId || saving}
                            onClick={() => handleAddToSite(entry.calledStationId)}
                          >
                            {saving ? 'Saving…' : 'Confirm'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setAddingFor(null); setSelectedSiteId('') }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function AnalyticsPageClient({
  from, to,
  kpi, trend, leaderboard, loginHealth, unattributed,
  allSites, errors,
}: Props) {
  function errorNote(key: string) {
    const msg = errors[key]
    if (!msg) return null
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        {msg}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Date range picker */}
      <div className="flex items-center gap-3">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <DateRangePicker from={from} to={to} />
      </div>

      {/* Section A: Usage Overview */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Usage Overview</h2>
        {errorNote('kpi')}
        <KpiCards kpi={kpi} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {errorNote('trend') ?? <UsageTrendChart trend={trend} />}
          {errorNote('leaderboard') ?? <SiteLeaderboardCard leaderboard={leaderboard} />}
        </div>
      </section>

      <Separator />

      {/* Section B: Live Activity */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Activity</h2>
        <div className="max-w-sm">
          <ActiveSessionsWidget />
        </div>
      </section>

      <Separator />

      {/* Section C: Diagnostics */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Diagnostics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {errorNote('loginHealth') ?? <LoginHealthCard loginHealth={loginHealth} />}
          <div className="lg:col-span-2">
            {errorNote('unattributed') ?? <UnattributedStationsTable data={unattributed} allSites={allSites} />}
          </div>
        </div>
      </section>
    </div>
  )
}
