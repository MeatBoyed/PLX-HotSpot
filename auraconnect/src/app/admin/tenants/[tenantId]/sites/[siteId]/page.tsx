import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Wifi, Users, Database, TrendingUp, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ConnectionsChart } from '@/components/dashboard/ConnectionsChart'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SiteStatusToggle } from './SiteStatusToggle'
import { DeleteSiteButton } from './DeleteSiteButton'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { radiusService } from '@/lib/services/radius.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { formatDataSize } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function SiteOverviewContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, radiusConfig, metrics, connectionData] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    radiusService.getBySiteId(siteId).catch(() => null),
    dashboardService.getSiteMetrics(siteId),
    dashboardService.getConnectionData(siteId),
  ])

  if (!tenant || !site) notFound()

  const portalUrl  = site.domain ? `https://${site.domain}` : null
  const gatewayUrl = radiusConfig?.gatewayUrl ?? null

  const siteLinks = (portalUrl || gatewayUrl) ? (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
      <span className="text-sm text-muted-foreground font-mono">{site.ssid}</span>
      {portalUrl && (
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
        >
          {portalUrl}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {gatewayUrl && (
        <a
          href={gatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline font-mono"
        >
          {gatewayUrl}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </span>
  ) : (
    <span className="text-sm text-muted-foreground font-mono">{site.ssid}</span>
  )

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
        description={siteLinks}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={site.status} />
            <SiteStatusToggle siteId={siteId} currentStatus={site.status} />
            <DeleteSiteButton tenantId={tenantId} siteId={siteId} siteName={site.name} siteStatus={site.status} />
          </div>
        }
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
