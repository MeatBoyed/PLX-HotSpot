import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SiteSettingsClient } from './SiteSettingsClient'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function SettingsContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
  ])

  if (!tenant || !site) notFound()

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'Settings' },
        ]}
        className="mb-4"
      />
      <PageHeader title="Site Settings" description={`Configure details for ${site.name}`} />
      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />
      <SiteSettingsClient site={site} />
    </>
  )
}

export default async function SiteSettingsPage({ params }: Props) {
  const { tenantId, siteId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Form />}>
      <SettingsContent tenantId={tenantId} siteId={siteId} />
    </Suspense>
  )
}
