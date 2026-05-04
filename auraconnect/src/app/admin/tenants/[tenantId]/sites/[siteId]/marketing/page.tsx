import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { MarketingDataTable } from '@/components/marketing/MarketingDataTable'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { marketingService } from '@/lib/services/marketing.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function MarketingContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, entries] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    marketingService.getBySiteId(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'Marketing' },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Marketing Data"
        description={`${entries.length} opt-in submissions for ${site.name}`}
      />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <MarketingDataTable entries={entries} siteSsid={site.ssid} />
    </>
  )
}

export default async function MarketingPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <MarketingContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
