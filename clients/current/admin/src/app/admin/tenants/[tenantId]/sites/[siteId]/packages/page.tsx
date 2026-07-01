import { packageService } from '@/lib/services/package.service'
import { PackagesPageClient } from './PackagesPageClient'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

export default async function PackagesPage({ params }: Props) {
  const { tenantId, siteId } = await params
  const packages = await packageService.getBySiteId(siteId)
  return <PackagesPageClient tenantId={tenantId} siteId={siteId} initialPackages={packages} />
}
