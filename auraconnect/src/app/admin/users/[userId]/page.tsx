import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { UserPermissionsClient } from './UserPermissionsClient'
import { userService } from '@/lib/services/user.service'
import { tenantService } from '@/lib/services/tenant.service'
import { isSuperAdmin } from '@/lib/clerk/auth'

interface Props {
  params: Promise<{ userId: string }>
}

async function PermissionsContent({ userId }: { userId: string }) {
  const superAdmin = await isSuperAdmin()
  if (!superAdmin) redirect('/admin')

  const [user, tenants] = await Promise.all([
    userService.getById(userId),
    tenantService.getAll(),
  ])

  if (!user) notFound()

  return <UserPermissionsClient user={user} tenants={tenants} />
}

export default async function UserPermissionsPage({ params }: Props) {
  const { userId } = await params
  return (
    <div className="p-6">
      <Suspense fallback={<LoadingSkeleton.Form />}>
        <PermissionsContent userId={userId} />
      </Suspense>
    </div>
  )
}
