import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Plus, Pencil, Wifi, Users, Database, UsersRound, CreditCard, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteCard } from '@/components/sites/SiteCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { transactionService } from '@/lib/services/transaction.service'
import { formatCurrency, formatDate, formatDateTime, formatDataSize } from '@/lib/utils/formatters'
import { AddSiteButton } from './AddSiteButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ tenantId: string }>
}

const txTypeBadge: Record<string, 'default' | 'secondary' | 'outline'> = {
  topup: 'default', purchase: 'secondary', refund: 'outline', adjustment: 'secondary',
}

async function TenantContent({ tenantId }: { tenantId: string }) {
  const [tenant, sites, metrics, hotspotUsers, transactions] = await Promise.all([
    tenantService.getById(tenantId),
    siteService.getByTenantId(tenantId),
    dashboardService.getTenantMetrics(tenantId),
    hotspotUserService.getByTenantId(tenantId),
    transactionService.getByTenantId(tenantId),
  ])

  if (!tenant) notFound()

  const siteNames = Object.fromEntries(sites.map((s) => [s.id, s.name]))
  const recentUsers = [...hotspotUsers]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5)
  const recentTxns = transactions.slice(0, 5)
  const totalRevenueCents = transactions
    .filter((t) => t.type === 'topup' && t.status === 'completed')
    .reduce((s, t) => s + t.amountCents, 0)

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
          </>
        }
      />

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Active Connections" value={metrics.totalActiveConnections.toLocaleString()}
          icon={<Wifi className="h-5 w-5" />} />
        <MetricCard title="Hotspot Users" value={hotspotUsers.length.toLocaleString()}
          icon={<UsersRound className="h-5 w-5" />} />
        <MetricCard title="Total Revenue" value={formatCurrency(totalRevenueCents / 100)}
          icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard title="Data Used Today" value={formatDataSize(metrics.totalDataUsageGb)}
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

      {/* Recent hotspot users + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Hotspot Users</h2>
            <Link href={`/admin/hotspot-users?tenant=${tenantId}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6 text-sm">No users yet</TableCell></TableRow>
                ) : recentUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/admin/hotspot-users/${u.id}`} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{u.firstName[0]}{u.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-32">{u.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{siteNames[u.siteId] ?? u.siteId}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatCurrency(u.walletBalanceCents / 100)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(u.registeredAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link href={`/admin/transactions?tenant=${tenantId}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
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
                    <TableCell>
                      <p className="text-sm font-medium">{t.userFullName}</p>
                      <p className="text-xs text-muted-foreground">{siteNames[t.siteId] ?? t.siteId}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={txTypeBadge[t.type] ?? 'secondary'} className="capitalize text-xs">
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn('text-sm font-semibold tabular-nums',
                      t.amountCents > 0 ? 'text-green-700 dark:text-green-400' : '')}>
                      {t.amountCents > 0 ? '+' : ''}{formatCurrency(t.amountCents / 100)}
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
