'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, UserX, Trash2, ShieldCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/utils/formatters'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { AdminUser } from '@/lib/types/user.types'

interface UserTableProps {
  users: AdminUser[]
  onSuspend: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const roleBadgeVariant = (role: AdminUser['role']) =>
  role === 'super_admin' ? 'default' : 'secondary'

export function UserTable({ users, onSuspend, onDelete }: UserTableProps) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'delete'; userId: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!confirmAction) return
    setLoading(true)
    try {
      if (confirmAction.type === 'suspend') await onSuspend(confirmAction.userId)
      else await onDelete(confirmAction.userId)
    } finally {
      setLoading(false)
      setConfirmAction(null)
    }
  }

  return (
    <>
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
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
                <TableCell>
                  <Badge variant={roleBadgeVariant(user.role)}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'active' ? 'outline' : user.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {user.lastSignInAt ? formatDateTime(user.lastSignInAt) : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" /> Manage Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setConfirmAction({ type: 'suspend', userId: user.id })}
                        className="text-yellow-600"
                      >
                        <UserX className="mr-2 h-4 w-4" /> Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setConfirmAction({ type: 'delete', userId: user.id })}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === 'delete' ? 'Delete User' : 'Suspend User'}
        description={
          confirmAction?.type === 'delete'
            ? 'This action cannot be undone. The user will permanently lose access.'
            : 'The user will be suspended and lose access until reinstated.'
        }
        confirmLabel={confirmAction?.type === 'delete' ? 'Delete' : 'Suspend'}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </>
  )
}
