'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog'
import { deleteTenantAction } from '@/lib/actions/tenants.actions'

interface Props {
  tenantId: string
  tenantName: string
  siteCount: number
}

export function DeleteTenantButton({ tenantId, tenantName, siteCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteTenantAction(tenantId)
        toast.success(`Tenant "${tenantName}" deleted`)
        router.push('/admin/tenants')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete tenant')
        setOpen(false)
      }
    })
  }

  const blockedReason = siteCount > 0
    ? `This tenant still has ${siteCount} site${siteCount !== 1 ? 's' : ''}. Delete all sites first before deleting the tenant.`
    : undefined

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 mr-2" /> Delete Tenant
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        entityType="tenant"
        name={tenantName}
        blockedReason={blockedReason}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  )
}
