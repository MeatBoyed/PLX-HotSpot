import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RadiusFormClient } from './RadiusFormClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { radiusService } from '@/lib/services/radius.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function RadiusContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, radiusConfig] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    radiusService.getBySiteId(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'RADIUS' },
        ]}
        className="mb-4"
      />
      <PageHeader title="RADIUS Configuration" description="Authentication server settings" />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <RadiusFormClient siteId={siteId} config={radiusConfig} />
    </>
  )
}

export default async function RadiusPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Form />}>
      <RadiusContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
