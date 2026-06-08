'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { deleteTenantAction } from '@/lib/actions/tenants.actions'

interface Props {
  tenantId: string
  tenantName: string
}

export function DeleteTenantButton({ tenantId, tenantName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [isPending, startTransition] = useTransition()

  const confirmed = typed === tenantName

  function handleOpen() {
    setTyped('')
    setOpen(true)
  }

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

  return (
    <>
      <Button variant="destructive" size="sm" onClick={handleOpen}>
        <Trash2 className="h-4 w-4 mr-2" /> Delete Tenant
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!isPending) setOpen(o) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete tenant</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All sites, users, and data
              associated with this tenant will be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-sm">
              Type <span className="font-semibold text-foreground">{tenantName}</span> to confirm
            </Label>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={tenantName}
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!confirmed || isPending}
            >
              {isPending ? 'Deleting…' : 'Confirm delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
