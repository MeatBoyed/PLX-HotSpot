'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Wallet, Package, Activity, Radio, UserX, Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/formatters'
import { suspendHotspotUserAction } from '@/lib/actions/hotspot-users.actions'
import type { HotspotUser } from '@/lib/types/hotspot-user.types'
import type { Transaction } from '@/lib/types/transaction.types'
import type { Site } from '@/lib/types/site.types'
import type { Tenant } from '@/lib/types/tenant.types'

interface HotspotUserDetailClientProps {
  user: HotspotUser
  transactions: Transaction[]
  sites: Site[]
  tenants: Tenant[]
}

export function HotspotUserDetailClient({ user: initialUser, transactions, sites, tenants }: HotspotUserDetailClientProps) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [suspending, setSuspending] = useState(false)

  const siteNames = Object.fromEntries(sites.map((s) => [s.id, s.name]))
  const tenantNames = Object.fromEntries(tenants.map((t) => [t.id, t.name]))
  const site = sites.find((s) => s.id === user.siteId)
  const tenant = tenants.find((t) => t.id === user.tenantId)

  const handleSuspend = async () => {
    setSuspending(true)
    try {
      await suspendHotspotUserAction(user.id)
      setUser((u) => ({ ...u, status: 'suspended' as const }))
      toast.success('User suspended')
    } finally {
      setSuspending(false)
    }
  }

  const bundleProgress = user.activeBundle?.dataLimitMb
    ? Math.min(100, (user.activeBundle.dataUsedMb / user.activeBundle.dataLimitMb) * 100)
    : null

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground"
        onClick={() => router.push('/admin/hotspot-users')}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Hotspot Users
      </Button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg font-bold">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>{user.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {user.phone && <p className="text-muted-foreground text-sm">{user.phone}</p>}
          {/* Tenant / Site origin */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {tenant && (
              <div className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{tenant.name}</span>
              </div>
            )}
            {tenant && site && <span className="text-muted-foreground text-xs">›</span>}
            {site && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{site.name}</span>
                <span className="font-mono text-xs">({site.ssid})</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered {formatDate(user.registeredAt)}
            {user.lastLoginAt && ` · Last login ${formatRelativeTime(user.lastLoginAt)}`}
          </p>
        </div>
        {user.status === 'active' && (
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleSuspend} disabled={suspending}>
            <UserX className="h-4 w-4 mr-2" />
            {suspending ? 'Suspending…' : 'Suspend User'}
          </Button>
        )}
      </div>

      <Separator />

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(user.walletBalanceCents / 100)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {transactions.filter(t => t.type === 'topup' && t.status === 'completed').length} top-up{transactions.filter(t => t.type === 'topup' && t.status === 'completed').length !== 1 ? 's' : ''} total
            </p>
          </CardContent>
        </Card>

        {/* Active bundle */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Active Bundle</CardTitle>
          </CardHeader>
          <CardContent>
            {user.activeBundle ? (
              <div className="space-y-1">
                <p className="font-semibold">{user.activeBundle.name}</p>
                <p className="text-xs text-muted-foreground">
                  Expires {formatDateTime(user.activeBundle.expiresAt)}
                </p>
                {bundleProgress !== null ? (
                  <>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${bundleProgress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.activeBundle.dataUsedMb} MB / {user.activeBundle.dataLimitMb} MB used
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.activeBundle.dataUsedMb} MB used · unlimited data
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active bundle</p>
            )}
          </CardContent>
        </Card>

        {/* RADIUS / Info */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div>
              <p className="text-xs text-muted-foreground">RADIUS ID</p>
              <p className="text-xs font-mono">{user.radiusId ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marketing</p>
              <Badge variant={user.marketingOptIn ? 'default' : 'secondary'} className="text-xs">
                {user.marketingOptIn ? 'Opted in' : 'Opted out'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total spent</p>
              <p className="text-sm font-medium tabular-nums">
                {formatCurrency(
                  Math.abs(transactions.filter(t => t.type === 'purchase' && t.status === 'completed').reduce((s, t) => s + t.amountCents, 0)) / 100
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Transaction History</h2>
        </div>
        <TransactionTable
          transactions={transactions}
          siteNames={siteNames}
          filename={`user-${user.id}-transactions`}
        />
      </div>
    </div>
  )
}
