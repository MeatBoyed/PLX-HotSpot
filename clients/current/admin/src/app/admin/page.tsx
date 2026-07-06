import { Suspense } from 'react'
import { Wifi, Users, Database, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed'
import { TopPackagesList } from '@/components/dashboard/TopPackagesList'
import { ConnectionsChart } from '@/components/dashboard/ConnectionsChart'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { dashboardService } from '@/lib/services/dashboard.service'
import { formatDataSize } from '@/lib/utils/formatters'

async function DashboardContent() {
  const [metrics, topPackages, activity, connectionData] = await Promise.all([
    dashboardService.getGlobalMetrics(),
    dashboardService.getTopPackages(),
    dashboardService.getRecentActivity(),
    dashboardService.getConnectionData('all'),
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Connections"
          value={metrics.totalActiveConnections.toLocaleString()}
          subtitle="Right now"
          icon={<Wifi className="h-5 w-5" />}
        />
        <MetricCard
          title="New Users Today"
          value={metrics.totalNewUsersToday.toLocaleString()}
          subtitle="Across all sites"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Data Used Today"
          value={formatDataSize(metrics.totalDataUsageGb)}
          subtitle="All tenants combined"
          icon={<Database className="h-5 w-5" />}
        />
        <MetricCard
          title="Active Tenants"
          value={`${metrics.totalTenants} tenants`}
          subtitle={`${metrics.totalSites} sites total`}
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionsChart data={connectionData} />
        <TopPackagesList packages={topPackages} />
      </div>

      <RecentActivityFeed activities={activity} />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of all tenants and sites"
      />
      <Suspense fallback={<LoadingSkeleton.Page />}>
        <DashboardContent />
      </Suspense>
    </>
  )
}
