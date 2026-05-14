import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { HotspotUserDetailClient } from './HotspotUserDetailClient'
import { hotspotUserService } from '@/lib/services/hotspot-user.service'
import { transactionService } from '@/lib/services/transaction.service'

interface Props {
  params: Promise<{ userId: string }>
}

async function UserDetailContent({ userId }: { userId: string }) {
  const [user, walletBalance, packages, txPaged] = await Promise.all([
    hotspotUserService.getById(userId),
    hotspotUserService.getWalletBalance(userId),
    hotspotUserService.getPackages(userId),
    transactionService.getAll({ profileId: userId, pageSize: 100 }),
  ])

  if (!user) notFound()

  return (
    <HotspotUserDetailClient
      user={user}
      walletBalance={walletBalance}
      packages={packages}
      transactions={txPaged.items}
    />
  )
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
