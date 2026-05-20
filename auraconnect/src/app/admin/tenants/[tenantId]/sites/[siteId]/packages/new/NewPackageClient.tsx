'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { PackageForm } from '@/components/packages/PackageForm'
import { createPackageAction } from '@/lib/actions/packages.actions'
import type { CreatePackageInput } from '@/lib/types/package.types'

interface Props {
  tenantId: string
  siteId: string
}

export function NewPackageClient({ tenantId, siteId }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (values: CreatePackageInput) => {
    setSaving(true)
    try {
      await createPackageAction(siteId, values)
      toast.success('Package created')
      router.push(`/admin/tenants/${tenantId}/sites/${siteId}/packages`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create package')
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <PackageForm
          onSubmit={handleSubmit as never}
          onCancel={() => router.push(`/admin/tenants/${tenantId}/sites/${siteId}/packages`)}
          loading={saving}
        />
      </CardContent>
    </Card>
  )
}
