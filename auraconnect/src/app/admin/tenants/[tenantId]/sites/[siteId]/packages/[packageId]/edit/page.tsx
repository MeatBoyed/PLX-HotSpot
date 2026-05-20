import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { packageService } from '@/lib/services/package.service'
import { EditPackageClient } from './EditPackageClient'

interface Props {
  params: Promise<{ tenantId: string; siteId: string; packageId: string }>
}

export default async function EditPackagePage({ params }: Props) {
  const { tenantId, siteId, packageId } = await params
  const pkg = await packageService.getById(siteId, packageId)
  if (!pkg) notFound()

  const backHref = `/admin/tenants/${tenantId}/sites/${siteId}/packages`
  return (
    <>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Packages
      </Link>
      <PageHeader title={`Edit: ${pkg.name}`} description="Update package details and limits" />
      <div className="max-w-2xl">
        <EditPackageClient tenantId={tenantId} siteId={siteId} pkg={pkg} />
      </div>
    </>
  )
}
