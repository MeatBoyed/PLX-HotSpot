import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Wifi, Users, Database, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ConnectionsChart } from '@/components/dashboard/ConnectionsChart'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { formatDataSize } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function SiteOverviewContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, metrics, connectionData] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    dashboardService.getSiteMetrics(siteId),
    dashboardService.getConnectionData(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name },
        ]}
        className="mb-4"
      />

      <PageHeader
        title={site.name}
        description={site.ssid}
        actions={<StatusBadge status={site.status} />}
      />

      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Active Connections"
          value={metrics.activeConnections.toLocaleString()}
          subtitle="Right now"
          icon={<Wifi className="h-5 w-5" />}
        />
        <MetricCard
          title="New Users Today"
          value={metrics.newUsersToday.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Data Used Today"
          value={formatDataSize(metrics.dataUsageGb)}
          icon={<Database className="h-5 w-5" />}
        />
        <MetricCard
          title="All-time Users"
          value={metrics.totalUsersAllTime.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="max-w-2xl">
        <ConnectionsChart data={connectionData} />
      </div>
    </>
  )
}

export default async function SitePage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Page />}>
      <SiteOverviewContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
