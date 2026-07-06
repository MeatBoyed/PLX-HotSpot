import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { NewPackageClient } from './NewPackageClient'

interface Props {
  params: Promise<{ tenantId: string; siteId: string }>
}

export default async function NewPackagePage({ params }: Props) {
  const { tenantId, siteId } = await params
  const backHref = `/admin/tenants/${tenantId}/sites/${siteId}/packages`
  return (
    <>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Packages
      </Link>
      <PageHeader title="New Package" description="Create a new hotspot package for this site" />
      <div className="max-w-2xl">
        <NewPackageClient tenantId={tenantId} siteId={siteId} />
      </div>
    </>
  )
}
