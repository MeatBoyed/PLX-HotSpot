import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { AuthMethodsFormClient } from './AuthMethodsFormClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { authMethodsService } from '@/lib/services/auth-methods.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function AuthMethodsContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, authMethods] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
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
          { label: 'Auth Methods' },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Auth Methods"
        description="Control how users authenticate on the captive portal"
      />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <AuthMethodsFormClient siteId={siteId} selected={authMethods} />
    </>
  )
}

export default async function AuthMethodsPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Form />}>
      <AuthMethodsContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
