import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { GatewaySessionsPageClient } from './GatewaySessionsPageClient'
import { gatewaySessionService } from '@/lib/services/gateway-session.service'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import type { GatewayLoginOutcome } from '@/lib/types/gateway-session.types'

interface Props {
  searchParams: Promise<{
    tenantId?: string
    siteId?: string
    mac?: string
    outcome?: string
    from?: string
    to?: string
    page?: string
  }>
}

const VALID_OUTCOMES: GatewayLoginOutcome[] = ['Pending', 'Success', 'Failed']

async function GatewaySessionsContent({ searchParams }: Props) {
  const sp = await searchParams
  const tenantId = sp.tenantId && sp.tenantId !== 'all' ? sp.tenantId : undefined
  const siteId = sp.siteId && sp.siteId !== 'all' ? sp.siteId : undefined
  const outcome = VALID_OUTCOMES.includes(sp.outcome as GatewayLoginOutcome)
    ? (sp.outcome as GatewayLoginOutcome)
    : undefined
  const mac = sp.mac || undefined
  const from = sp.from || undefined
  const to = sp.to || undefined
  const page = Math.max(1, Number(sp.page ?? 1))

  const [paged, tenants, sites] = await Promise.all([
    gatewaySessionService.getAll({ page, pageSize: 50, tenantId, siteId, mac, outcome, from, to }),
    tenantService.getAll(),
    siteService.getAll(),
  ])

  return (
    <>
      <PageHeader
        title="Gateway Sessions"
        description={`${paged.totalCount} captive-portal login attempts`}
      />
      <GatewaySessionsPageClient
        paged={paged}
        tenants={tenants}
        sites={sites}
        currentTenantId={sp.tenantId ?? 'all'}
        currentSiteId={sp.siteId ?? 'all'}
        currentOutcome={outcome ?? 'all'}
        currentMac={sp.mac ?? ''}
        currentFrom={sp.from ?? ''}
        currentTo={sp.to ?? ''}
        currentPage={page}
      />
    </>
  )
}

export default async function GatewaySessionsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <GatewaySessionsContent searchParams={searchParams} />
    </Suspense>
  )
}
