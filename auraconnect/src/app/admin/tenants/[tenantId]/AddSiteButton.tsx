'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SiteForm } from '@/components/sites/SiteForm'
import { createSiteAction } from '@/lib/actions/sites.actions'

export function AddSiteButton({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleCreate = async (values: Omit<Parameters<typeof createSiteAction>[0], 'tenantId'>) => {
    setSaving(true)
    try {
      const site = await createSiteAction({ ...values, tenantId })
      toast.success(`Site "${site.name}" created`)
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to create site')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Add Site
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Site</DialogTitle>
          </DialogHeader>
          <SiteForm onSubmit={handleCreate} onCancel={() => setOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>
    </>
  )
}
