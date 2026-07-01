import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Separator } from '@/components/ui/separator'
import { RadiusFormClient } from './RadiusFormClient'
import { AuthMethodsFormClient } from './AuthMethodsFormClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { radiusService } from '@/lib/services/radius.service'
import { authMethodsService } from '@/lib/services/auth-methods.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function RadiusContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, radiusConfig, authMethods] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    radiusService.getBySiteId(siteId),
    authMethodsService.getBySiteId(siteId),
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
      <PageHeader title="RADIUS Configuration" description="Authentication server settings and login methods" />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />

      <div className="space-y-10">
        <section>
          <h2 className="text-base font-semibold mb-3">RADIUS &amp; Gateway</h2>
          <RadiusFormClient siteId={siteId} config={radiusConfig} ssid={site.ssid} />
        </section>

        <Separator />

        <section>
          <h2 className="text-base font-semibold mb-3">Auth Methods</h2>
          <AuthMethodsFormClient siteId={siteId} selected={authMethods} />
        </section>
      </div>
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
