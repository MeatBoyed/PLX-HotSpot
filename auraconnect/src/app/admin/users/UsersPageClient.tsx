'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { UserTable } from '@/components/users/UserTable'
import { suspendUserAction, deleteUserAction } from '@/lib/actions/users.actions'
import type { AdminUser } from '@/lib/types/user.types'

export function UsersPageClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers)

  const handleSuspend = async (id: string) => {
    await suspendUserAction(id)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'suspended' as const } : u)))
    toast.success('User suspended')
  }

  const handleDelete = async (id: string) => {
    await deleteUserAction(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <UserPlus className="h-4 w-4 mr-2" /> Invite User
        </Button>
      </div>
      <UserTable users={users} onSuspend={handleSuspend} onDelete={handleDelete} />
    </div>
  )
}
