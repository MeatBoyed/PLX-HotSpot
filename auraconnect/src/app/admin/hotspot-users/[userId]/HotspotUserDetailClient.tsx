'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Wallet, Package, Activity, UserX, UserCheck, MapPin, Building2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters'
import { updateProfileStatusAction, softDeleteProfileAction, hardDeleteProfileAction } from '@/lib/actions/hotspot-users.actions'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { HotspotUserDetail, UserPackage } from '@/lib/types/hotspot-user.types'
import type { Transaction } from '@/lib/types/transaction.types'

interface Props {
  user: HotspotUserDetail
  packages: UserPackage[]
  transactions: Transaction[]
}

function statusVariant(status: string): 'outline' | 'destructive' | 'secondary' {
  if (status.toLowerCase() === 'active') return 'outline'
  if (status.toLowerCase() === 'suspended') return 'destructive'
  return 'secondary'
}

export function HotspotUserDetailClient({ user: initialUser, packages, transactions }: Props) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [updating, setUpdating] = useState(false)
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false)
  const [hardDeleteOpen, setHardDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isSuspended = user.status.toLowerCase() === 'suspended'

  const handleSoftDelete = async () => {
    setDeleting(true)
    try {
      await softDeleteProfileAction(user.id)
      toast.success('User deleted')
      router.push('/admin/hotspot-users')
    } catch {
      toast.error('Failed to delete user')
      setDeleting(false)
    }
  }

  const handleHardDelete = async () => {
    setDeleting(true)
    try {
      await hardDeleteProfileAction(user.id)
      toast.success('User permanently deleted')
      router.push('/admin/hotspot-users')
    } catch {
      toast.error('Failed to permanently delete user')
      setDeleting(false)
    }
  }

  const handleStatusToggle = async () => {
    setUpdating(true)
    try {
      const newStatus = isSuspended ? 'Active' : 'Suspended'
      const updated = await updateProfileStatusAction(user.id, newStatus)
      setUser(updated)
      toast.success(`User ${newStatus.toLowerCase()}`)
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Button
        variant="ghost" size="sm" className="-ml-2 text-muted-foreground"
        onClick={() => router.push('/admin/hotspot-users')}
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Hotspot Users
      </Button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {user.phoneNumber && <p className="text-muted-foreground text-sm">{user.phoneNumber}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Registered {formatDate(user.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={isSuspended
            ? 'text-green-700 border-green-300 hover:bg-green-50'
            : 'text-destructive border-destructive/30 hover:bg-destructive/5'
          }
          onClick={handleStatusToggle}
          disabled={updating}
        >
          {isSuspended ? (
            <><UserCheck className="h-4 w-4 mr-2" />{updating ? 'Activating…' : 'Activate User'}</>
          ) : (
            <><UserX className="h-4 w-4 mr-2" />{updating ? 'Suspending…' : 'Suspend User'}</>
          )}
        </Button>
      </div>

      <Separator />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(user.balance, 'ZAR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{packages.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {packages.filter((p) => p.status.toLowerCase() === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Sites Visited</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.memberships.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.memberships.length === 1 ? '1 location' : `${user.memberships.length} locations`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Memberships */}
      {user.memberships.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Site Memberships</h2>
          </div>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>First Visit</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.memberships.map((m) => (
                  <TableRow key={m.siteId}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{m.siteName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.firstVisitAt ? formatDateTime(m.firstVisitAt) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.lastVisitAt ? formatDateTime(m.lastVisitAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Purchased Packages</h2>
          </div>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="text-sm font-medium">{pkg.packageName}</TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {formatCurrency(pkg.amountPaid, pkg.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.status.toLowerCase() === 'active' ? 'outline' : 'secondary'}>
                        {pkg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(pkg.purchasedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {pkg.expiresAt ? formatDateTime(pkg.expiresAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Transaction History</h2>
        </div>
        <TransactionTable
          transactions={transactions}
          filename={`user-${user.id}-transactions`}
          compact
        />
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/40 p-4 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="font-semibold text-sm">Danger Zone</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">Delete User</p>
            <p className="text-xs text-muted-foreground">Marks this user as deleted. They will not be able to log in but their data is preserved.</p>
          </div>
          <Button
            variant="outline" size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/5 shrink-0"
            onClick={() => setSoftDeleteOpen(true)}
            disabled={deleting || user.status.toLowerCase() === 'deleted'}
          >
            <UserX className="h-4 w-4 mr-2" />
            {user.status.toLowerCase() === 'deleted' ? 'Already Deleted' : 'Delete User'}
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">Permanently Delete</p>
            <p className="text-xs text-muted-foreground">Irreversibly removes this user and all associated data. This cannot be undone.</p>
          </div>
          <Button
            variant="destructive" size="sm" className="shrink-0"
            onClick={() => setHardDeleteOpen(true)}
            disabled={deleting}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Permanently Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={softDeleteOpen}
        onOpenChange={setSoftDeleteOpen}
        title="Delete User"
        description={`This will mark ${user.firstName} ${user.lastName} as deleted. They will not be able to log in, but their data is preserved.`}
        loading={deleting}
        onConfirm={handleSoftDelete}
      />

      <ConfirmDialog
        open={hardDeleteOpen}
        onOpenChange={setHardDeleteOpen}
        title="Permanently Delete User"
        description={`This will permanently delete ${user.firstName} ${user.lastName} and all associated data. This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleHardDelete}
      />
    </div>
  )
}
