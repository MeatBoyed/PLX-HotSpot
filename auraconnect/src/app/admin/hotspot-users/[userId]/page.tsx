import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { HotspotUserDetailClient } from './HotspotUserDetailClient'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { siteService } from '@/lib/services/site.service'
import { tenantService } from '@/lib/services/tenant.service'

interface Props {
  params: Promise<{ userId: string }>
}

async function UserDetailContent({ userId }: { userId: string }) {
  const [user, sites, tenants] = await Promise.all([
    hotspotUserService.getById(userId),
    siteService.getAll(),
    tenantService.getAll(),
  ])
  if (!user) notFound()

  const transactions = await hotspotUserService.getTransactions(userId)

  return <HotspotUserDetailClient user={user} transactions={transactions} sites={sites} tenants={tenants} />
}

export default async function HotspotUserDetailPage({ params }: Props) {
  const { userId } = await params
  return (
    <div className="p-6">
      <Suspense fallback={<LoadingSkeleton.Form />}>
        <UserDetailContent userId={userId} />
      </Suspense>
    </div>
  )
}
