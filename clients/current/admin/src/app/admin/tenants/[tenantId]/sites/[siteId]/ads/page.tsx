import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { AdsFormClient } from './AdsFormClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { adsService } from '@/lib/services/ads.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function AdsContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, adsConfig] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    adsService.getBySiteId(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'Ads' },
        ]}
        className="mb-4"
      />
      <PageHeader title="Ads Configuration" description="Configure ad display on the captive portal" />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <AdsFormClient siteId={siteId} config={adsConfig} />
    </>
  )
}

export default async function AdsPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Form />}>
      <AdsContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
