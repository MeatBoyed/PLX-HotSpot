import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Pencil, Wifi, Database, UsersRound, CreditCard, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteCard } from '@/components/sites/SiteCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GatewaySessionTable } from '@/components/gateway-sessions/GatewaySessionTable'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { transactionService } from '@/lib/services/transaction.service'
import { gatewaySessionService } from '@/lib/services/gateway-session.service'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { AddSiteButton } from './AddSiteButton'
import { DeleteTenantButton } from './DeleteTenantButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ tenantId: string }>
}

function txBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  const t = type.toLowerCase()
  if (t === 'topup') return 'default'
  if (t === 'purchase') return 'secondary'
  return 'outline'
}

async function TenantContent({ tenantId }: { tenantId: string }) {
  const [tenant, sites, metrics, pagedUsers, pagedTxns, pagedSessions] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getByTenantId(tenantId),
    dashboardService.getTenantMetrics(tenantId),
    hotspotUserService.getAll({ tenantId, pageSize: 5 }),
    transactionService.getAll({ tenantId, pageSize: 5 }),
    gatewaySessionService.getAll({ tenantId, pageSize: 5 }).catch(() => null),
  ])

  if (!tenant) notFound()

  const recentTxns = pagedTxns.items
  const siteNameById = Object.fromEntries(sites.map((s) => [s.id, s.name]))
  const totalRevenue = pagedTxns.items
    .filter((t) => t.type.toLowerCase() === 'topup' && t.status.toLowerCase() === 'completed')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <Breadcrumb items={[{ label: 'Tenants', href: '/admin/tenants' }, { label: tenant.name }]} className="mb-4" />

      <PageHeader
        title={tenant.name}
        description={`${sites.length} sites`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit Tenant
            </Button>
            <AddSiteButton tenantId={tenantId} />
            <DeleteTenantButton tenantId={tenantId} tenantName={tenant.name} siteCount={sites.length} />
          </>
        }
      />

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Active Connections" value={metrics.totalActiveConnections.toLocaleString()}
          icon={<Wifi className="h-5 w-5" />} />
        <MetricCard title="Hotspot Users" value={pagedUsers.totalCount.toLocaleString()}
          icon={<UsersRound className="h-5 w-5" />} />
        <MetricCard title="Total Revenue" value={formatCurrency(totalRevenue)}
          icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard title="Data Used Today" value={`${metrics.totalDataUsageGb.toFixed(1)} GB`}
          icon={<Database className="h-5 w-5" />} />
      </div>

      {/* Sites */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Sites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} tenantId={tenantId} />
          ))}
        </div>
      </div>

      {/* Recent gateway sessions + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gateway Sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Gateway Sessions</h2>
            <Link href={`/admin/gateway-sessions?tenantId=${tenantId}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <GatewaySessionTable sessions={pagedSessions?.items ?? []} siteNameById={siteNameById} />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link href={`/admin/transactions?tenantId=${tenantId}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTxns.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">No transactions yet</TableCell></TableRow>
                ) : recentTxns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-32">{t.reference}</TableCell>
                    <TableCell>
                      <Badge variant={txBadgeVariant(t.type)} className="capitalize text-xs">{t.type}</Badge>
                    </TableCell>
                    <TableCell className={cn('text-sm font-semibold tabular-nums',
                      t.amount > 0 ? 'text-green-700 dark:text-green-400' : '')}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount, t.currency)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}

export default async function TenantPage({ params }: Props) {
  const { tenantId } = await params
  return (
    <Suspense fallback={<LoadingSkeleton.Page />}>
      <TenantContent tenantId={tenantId} />
    </Suspense>
  )
}
