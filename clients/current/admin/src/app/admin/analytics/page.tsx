import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { metricsService } from '@/lib/services/metrics.service'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { AnalyticsPageClient } from './AnalyticsPageClient'

interface Props {
  searchParams: Promise<{ from?: string; to?: string; metric?: string }>
}

async function settle<T>(p: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await p, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

function defaultFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10)
}

async function AnalyticsContent({ from, to, metric }: { from: string; to: string; metric: string }) {
  const dateParams = { from, to }

  const [kpiResult, trendResult, leaderboardResult, loginHealthResult, unattributedResult] = await Promise.all([
    settle(metricsService.getKpiSummary(dateParams)),
    settle(metricsService.getUsageTrend(dateParams)),
    settle(metricsService.getSiteLeaderboard({ ...dateParams, metric })),
    settle(metricsService.getLoginHealth(dateParams)),
    settle(metricsService.getUnattributedStations(dateParams)),
  ])

  // Fetch all sites for the "Add to site" dialog in unattributed stations
  const tenants = await tenantService.getAll().catch(() => [])
  const sitesByTenant = await Promise.all(tenants.map((t) => siteService.getByTenantId(t.id).catch(() => [])))
  const allSites = sitesByTenant.flat()

  return (
    <AnalyticsPageClient
      from={from}
      to={to}
      kpi={kpiResult.data}
      trend={trendResult.data}
      leaderboard={leaderboardResult.data}
      loginHealth={loginHealthResult.data}
      unattributed={unattributedResult.data}
      allSites={allSites}
      errors={{
        kpi:          kpiResult.error,
        trend:        trendResult.error,
        leaderboard:  leaderboardResult.error,
        loginHealth:  loginHealthResult.error,
        unattributed: unattributedResult.error,
      }}
    />
  )
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams
  const from   = params.from   ?? defaultFrom()
  const to     = params.to     ?? defaultTo()
  const metric = params.metric ?? 'data'

  return (
    <>
      <PageHeader title="Analytics" description="RADIUS usage metrics, live activity, and diagnostics" />
      <Suspense fallback={<LoadingSkeleton.Page />}>
        <AnalyticsContent from={from} to={to} metric={metric} />
      </Suspense>
    </>
  )
}
