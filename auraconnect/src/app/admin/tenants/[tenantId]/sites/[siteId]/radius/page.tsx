import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AlertOctagon } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Separator } from '@/components/ui/separator'
import { RadiusFormClient } from './RadiusFormClient'
import { AuthMethodsFormClient } from './AuthMethodsFormClient'
import { GatewayStatusCard } from './GatewayStatusCard'
import { NetworkStatusCard } from './NetworkStatusCard'
import { RefreshButton } from './RefreshButton'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { radiusService } from '@/lib/services/radius.service'
import { authMethodsService } from '@/lib/services/auth-methods.service'
import { mikrotikService } from '@/lib/services/mikrotik.service'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

async function settle<T>(p: Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await p, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

function EmptyOrError({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <AlertOctagon className="h-8 w-8 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        {error ?? 'No MikroTik data available for this site'}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        {error
          ? 'The router may be unreachable, or MikroTik credentials are not configured in Platform Settings.'
          : 'Set a gateway URL above to enable MikroTik diagnostics.'}
      </p>
    </div>
  )
}

async function RadiusContent({ tenantId, siteId }: { tenantId: string; siteId: string }) {
  const [tenant, site, radiusConfig, authMethods] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getById(siteId),
    radiusService.getBySiteId(siteId),
    authMethodsService.getBySiteId(siteId),
  ])

  if (!tenant || !site) notFound()

  const [gateway, network] = await Promise.all([
    settle(mikrotikService.getGatewayStatus(siteId)),
    settle(mikrotikService.getNetworkStatus(siteId)),
  ])

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Tenants', href: '/admin/tenants' },
          { label: tenant.name, href: `/admin/tenants/${tenantId}` },
          { label: site.name, href: `/admin/tenants/${tenantId}/sites/${siteId}` },
          { label: 'Network' },
        ]}
        className="mb-4"
      />
      <PageHeader title="Network" description="Authentication server settings, login methods, and gateway diagnostics" />
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

        <Separator />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">MikroTik Diagnostics</h2>
            <RefreshButton />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {gateway.data ? <GatewayStatusCard data={gateway.data} /> : <EmptyOrError error={gateway.error} />}
            {network.data ? <NetworkStatusCard data={network.data} /> : <EmptyOrError error={network.error} />}
          </div>
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
