'use client'

import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import type { HotspotUser } from '@/lib/types/hotspot-user.types'

interface HotspotUserTableProps {
  users: HotspotUser[]
}

function statusVariant(status: string): 'outline' | 'destructive' | 'secondary' {
  if (status.toLowerCase() === 'active') return 'outline'
  if (status.toLowerCase() === 'suspended') return 'destructive'
  return 'secondary'
}

export function HotspotUserTable({ users }: HotspotUserTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sites</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/hotspot-users/${user.id}`)}
              >
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
                  {user.phoneNumber ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.siteIds.length > 0 ? `${user.siteIds.length} site${user.siteIds.length !== 1 ? 's' : ''}` : '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.createdAt ? formatDate(user.createdAt) : '—'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/admin/hotspot-users/${user.id}`)}
                  >
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
