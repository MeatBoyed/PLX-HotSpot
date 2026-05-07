'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { TenantCard } from '@/components/tenants/TenantCard'
import { TenantForm } from '@/components/tenants/TenantForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createTenantAction } from '@/lib/actions/tenants.actions'
import type { Tenant } from '@/lib/types/tenant.types'

interface Props {
  initialTenants: Tenant[]
}

export function TenantsPageClient({ initialTenants }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (values: Parameters<typeof createTenantAction>[0]) => {
    setSaving(true)
    try {
      const tenant = await createTenantAction(values)
      setTenants((prev) => [...prev, tenant])
      setDialogOpen(false)
      toast.success(`Tenant "${tenant.name}" created`)
    } catch {
      toast.error('Failed to create tenant')
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Tenant
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <TenantCard key={tenant.id} tenant={tenant} />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader className="hover:pointer">
            <DialogTitle>Create Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>
    </>
  )
}
