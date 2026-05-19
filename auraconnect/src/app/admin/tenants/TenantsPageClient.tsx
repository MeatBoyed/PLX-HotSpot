'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { TenantCard } from '@/components/tenants/TenantCard'
import { TenantForm } from '@/components/tenants/TenantForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createTenantAction, updateTenantAction } from '@/lib/actions/tenants.actions'
import type { Tenant } from '@/lib/types/tenant.types'

interface Props {
  initialTenants: Tenant[]
}

export function TenantsPageClient({ initialTenants }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Tenant | null>(null)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (values: { name: string; slug: string }) => {
    setSaving(true)
    try {
      const tenant = await createTenantAction(values)
      setTenants((prev) => [...prev, tenant])
      setCreateOpen(false)
      toast.success(`Tenant "${tenant.name}" created`)
    } catch {
      toast.error('Failed to create tenant')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (values: { name: string; slug: string }) => {
    if (!editTarget) return
    setSaving(true)
    try {
      const tenant = await updateTenantAction(editTarget.id, values)
      setTenants((prev) => prev.map((t) => (t.id === tenant.id ? tenant : t)))
      setEditTarget(null)
      toast.success(`Tenant "${tenant.name}" updated`)
    } catch {
      toast.error('Failed to update tenant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Tenants"
        description={`${tenants.length} tenants`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Tenant
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <TenantCard key={tenant.id} tenant={tenant} onEdit={() => setEditTarget(tenant)} />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm
            defaultValues={editTarget ?? undefined}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={saving}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
