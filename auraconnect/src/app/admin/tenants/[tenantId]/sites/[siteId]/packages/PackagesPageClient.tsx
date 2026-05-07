'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { PackageCard } from '@/components/packages/PackageCard'
import { PackageForm } from '@/components/packages/PackageForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
  deleteManyPackagesAction,
  togglePackageActiveAction,
} from '@/lib/actions/packages.actions'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

interface Props {
  tenantId: string
  siteId: string
  initialPackages: Package[]
}

export function PackagesPageClient({ tenantId, siteId, initialPackages }: Props) {
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Package | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (values: Omit<CreatePackageInput, 'siteId'>) => {
    setSaving(true)
    try {
      const pkg = await createPackageAction({ ...values, siteId })
      setPackages((prev) => [...prev, pkg])
      setDialogOpen(false)
      toast.success('Package created')
    } catch { toast.error('Failed to create package') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (values: UpdatePackageInput) => {
    if (!editTarget) return
    setSaving(true)
    try {
      const pkg = await updatePackageAction(editTarget.id, values)
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)))
      setEditTarget(null)
      toast.success('Package updated')
    } catch { toast.error('Failed to update package') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deletePackageAction(deleteTarget)
      setPackages((prev) => prev.filter((p) => p.id !== deleteTarget))
      setDeleteTarget(null)
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete') }
    finally { setSaving(false) }
  }

  const handleBulkDelete = async () => {
    setSaving(true)
    try {
      await deleteManyPackagesAction([...selected])
      setPackages((prev) => prev.filter((p) => !selected.has(p.id)))
      setSelected(new Set())
      setBulkDeleteOpen(false)
      toast.success('Packages deleted')
    } catch { toast.error('Failed to delete packages') }
    finally { setSaving(false) }
  }

  const handleToggle = async (id: string) => {
    try {
      const pkg = await togglePackageActiveAction(id)
      setPackages((prev) => prev.map((p) => (p.id === id ? pkg : p)))
    } catch { toast.error('Failed to toggle package') }
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  return (
    <>
      <PageHeader
        title="Packages"
        description={`${packages.length} packages`}
        actions={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete {selected.size}
              </Button>
            )}
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Package
            </Button>
          </div>
        }
      />

      <SiteConfigurationTabs tenantId={tenantId} siteId={siteId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onEdit={() => setEditTarget(pkg)}
            onDelete={() => setDeleteTarget(pkg.id)}
            onToggle={() => handleToggle(pkg.id)}
            selected={selected.has(pkg.id)}
            onSelect={(checked) => toggleSelect(pkg.id, checked)}
          />
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Package</DialogTitle></DialogHeader>
          <PackageForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
          <PackageForm defaultValues={editTarget ?? undefined} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} loading={saving} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Package"
        description="This will permanently delete the package. This cannot be undone."
        loading={saving}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} packages`}
        description="This will permanently delete the selected packages. This cannot be undone."
        loading={saving}
        onConfirm={handleBulkDelete}
      />
    </>
  )
}
