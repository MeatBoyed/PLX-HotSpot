'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { PackageForm } from '@/components/packages/PackageForm'
import { updatePackageAction } from '@/lib/actions/packages.actions'
import type { Package, UpdatePackageInput } from '@/lib/types/package.types'

interface Props {
  tenantId: string
  siteId: string
  pkg: Package
}

export function EditPackageClient({ tenantId, siteId, pkg }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (values: UpdatePackageInput) => {
    setSaving(true)
    try {
      await updatePackageAction(siteId, pkg.id, values)
      toast.success('Package updated')
      router.push(`/admin/tenants/${tenantId}/sites/${siteId}/packages`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update package')
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <PackageForm
          defaultValues={pkg}
          onSubmit={handleSubmit as never}
          onCancel={() => router.push(`/admin/tenants/${tenantId}/sites/${siteId}/packages`)}
          loading={saving}
        />
      </CardContent>
    </Card>
  )
}
