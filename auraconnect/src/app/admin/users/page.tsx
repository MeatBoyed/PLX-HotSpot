import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { UsersPageClient } from './UsersPageClient'
import { userService } from '@/lib/services/user.service'
import { isSuperAdmin } from '@/lib/clerk/auth'

async function UsersContent() {
  const superAdmin = await isSuperAdmin()
  if (!superAdmin) redirect('/admin')

  const users = await userService.getAll()

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage admin users and their permissions"
      />
      <UsersPageClient initialUsers={users} />
    </>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton.Table />}>
      <UsersContent />
    </Suspense>
  )
}
