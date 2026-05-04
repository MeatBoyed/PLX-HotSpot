import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Wifi, Users, Database } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteCard } from '@/components/sites/SiteCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { formatDataSize } from '@/lib/utils/formatters'
import { AddSiteButton } from './AddSiteButton'

interface Props {
  params: Promise<{ tenantId: string }>
}

async function TenantContent({ tenantId }: { tenantId: string }) {
  const [tenant, sites, metrics] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getByTenantId(tenantId),
    dashboardService.getTenantMetrics(tenantId),
  ])

  if (!tenant) notFound()

  return (
    <>
      <Breadcrumb items={[{ label: 'Tenants', href: '/admin/tenants' }, { label: tenant.name }]} className="mb-4" />

      <PageHeader
        title={tenant.name}
        description={tenant.description ?? `${sites.length} sites`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit Tenant
            </Button>
            <AddSiteButton tenantId={tenantId} />
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Active Connections"
          value={metrics.totalActiveConnections.toLocaleString()}
          icon={<Wifi className="h-5 w-5" />}
        />
        <MetricCard
          title="New Users Today"
          value={metrics.totalNewUsersToday.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Data Used Today"
          value={formatDataSize(metrics.totalDataUsageGb)}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Sites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} tenantId={tenantId} />
          ))}
        </div>
      </div>
    </>
  )
}

export default async function TenantPage({ params }: Props) {
  const { tenantId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Page />}>
      <TenantContent tenantId={tenantId} />
    </Suspense>
  )
}
