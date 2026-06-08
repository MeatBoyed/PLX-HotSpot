import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { MailX, Settings2 } from 'lucide-react'
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
  const [tenant, site] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
  ])

  if (!tenant || !site) notFound()

  const entries = site.marketingOptIn
    ? await marketingService.getBySiteId(siteId)
    : []

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
        title="Marketing Opt-in"
        description={
          site.marketingOptIn
            ? `${entries.length} opt-in submission${entries.length !== 1 ? 's' : ''} for ${site.name}`
            : `Marketing opt-in is disabled for ${site.name}`
        }
      />

      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />

      {site.marketingOptIn ? (
        <MarketingDataTable entries={entries} siteSsid={site.ssid} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <MailX className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Marketing opt-in is disabled</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Enable it in Site Settings to start collecting opt-in submissions from users.
          </p>
          <Link
            href={`/admin/tenants/${tenantId}/sites/${siteId}/settings`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Settings2 className="h-4 w-4" /> Go to Site Settings
          </Link>
        </div>
      )}
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
