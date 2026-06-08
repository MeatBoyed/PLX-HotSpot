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

// Reference site whose branding is used as the "Auraconnect defaults" preset.
const AURACONNECT_DEFAULT_SITE_ID = '9e043a3b3016466aa8573b7d60297c23'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function BrandingContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, branding, defaultBranding] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    brandingService.getBySiteId(siteId),
    siteId !== AURACONNECT_DEFAULT_SITE_ID
      ? brandingService.getBySiteId(AURACONNECT_DEFAULT_SITE_ID).catch(() => null)
      : Promise.resolve(null),
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
      <BrandingFormClient siteId={siteId} config={branding} defaultBranding={defaultBranding} />
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
