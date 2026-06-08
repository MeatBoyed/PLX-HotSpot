'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog'
import { deleteSiteAction } from '@/lib/actions/sites.actions'
import type { SiteStatus } from '@/lib/types/site.types'

interface Props {
  tenantId: string
  siteId: string
  siteName: string
  siteStatus: SiteStatus
}

export function DeleteSiteButton({ tenantId, siteId, siteName, siteStatus }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canDelete = siteStatus === 'inactive'

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteSiteAction(siteId)
        toast.success(`Site "${siteName}" deleted`)
        router.push(`/admin/tenants/${tenantId}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete site')
        setOpen(false)
      }
    })
  }

  return (
    <>
      <span
        title={canDelete ? undefined : 'Set site status to Inactive before deleting'}
        className="inline-flex"
      >
        <Button
          variant="destructive"
          size="sm"
          disabled={!canDelete}
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Site
        </Button>
      </span>

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        entityType="site"
        name={siteName}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  )
}
