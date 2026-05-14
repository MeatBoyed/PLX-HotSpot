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

  const handleCreate = async (values: CreatePackageInput | UpdatePackageInput) => {
    setSaving(true)
    try {
      const pkg = await createPackageAction(siteId, values as CreatePackageInput)
      setPackages((prev) => [...prev, pkg])
      setDialogOpen(false)
      toast.success('Package created')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create package') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (values: CreatePackageInput | UpdatePackageInput) => {
    if (!editTarget) return
    setSaving(true)
    try {
      const pkg = await updatePackageAction(siteId, editTarget.id, values as UpdatePackageInput)
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)))
      setEditTarget(null)
      toast.success('Package updated')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update package') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deletePackageAction(siteId, deleteTarget)
      setPackages((prev) => prev.filter((p) => p.id !== deleteTarget))
      setDeleteTarget(null)
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete package') }
    finally { setSaving(false) }
  }

  const handleBulkDelete = async () => {
    setSaving(true)
    try {
      await deleteManyPackagesAction(siteId, [...selected])
      setPackages((prev) => prev.filter((p) => !selected.has(p.id)))
      setSelected(new Set())
      setBulkDeleteOpen(false)
      toast.success('Packages deleted')
    } catch { toast.error('Failed to delete packages') }
    finally { setSaving(false) }
  }

  const handleToggle = async (pkg: Package) => {
    try {
      const updated = await togglePackageActiveAction(siteId, pkg.id, pkg.isActive)
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
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
        description={`${packages.length} package${packages.length !== 1 ? 's' : ''}`}
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

      {packages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No packages yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => setEditTarget(pkg)}
              onDelete={() => setDeleteTarget(pkg.id)}
              onToggle={() => handleToggle(pkg)}
              selected={selected.has(pkg.id)}
              onSelect={(checked) => toggleSelect(pkg.id, checked)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Package</DialogTitle></DialogHeader>
          <PackageForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
          <PackageForm
            defaultValues={editTarget ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={saving}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Package"
        description="This will permanently delete this package. Users who have already purchased it will not be affected."
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
