'use client'

import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Wallet, PackageCheck, Eye } from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/formatters'
import type { HotspotUser } from '@/lib/types/hotspot-user.types'

interface HotspotUserTableProps {
  users: HotspotUser[]
  siteNames: Record<string, string>
}

export function HotspotUserTable({ users, siteNames }: HotspotUserTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Active Bundle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                No hotspot users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/hotspot-users/${user.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {siteNames[user.siteId] ?? user.siteId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatCurrency(user.walletBalanceCents / 100)}
                  </div>
                </TableCell>
                <TableCell>
                  {user.activeBundle ? (
                    <div className="flex items-center gap-1.5">
                      <PackageCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">{user.activeBundle.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(user.registeredAt)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => router.push(`/admin/hotspot-users/${user.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
