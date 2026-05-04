import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { BrandingFormClient } from './BrandingFormClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { brandingService } from '@/lib/services/branding.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function BrandingContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, branding] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    brandingService.getBySiteId(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'Branding' },
        ]}
        className="mb-4"
      />
      <PageHeader title="Branding" description="Customise the captive portal appearance" />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <BrandingFormClient siteId={siteId} config={branding} />
    </>
  )
}

export default async function BrandingPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Form />}>
      <BrandingContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
