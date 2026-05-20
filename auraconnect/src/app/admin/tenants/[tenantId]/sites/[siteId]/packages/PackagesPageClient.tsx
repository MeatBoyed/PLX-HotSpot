'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { SiteConfigurationTabs } from '@/components/sites/SiteConfigurationTabs'
import { PackageCard } from '@/components/packages/PackageCard'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  deletePackageAction,
  deleteManyPackagesAction,
  togglePackageActiveAction,
} from '@/lib/actions/packages.actions'
import type { Package } from '@/lib/types/package.types'

interface Props {
  tenantId: string
  siteId: string
  initialPackages: Package[]
}

export function PackagesPageClient({ tenantId, siteId, initialPackages }: Props) {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const newHref = `/admin/tenants/${tenantId}/sites/${siteId}/packages/new`
  const editHref = (id: string) => `/admin/tenants/${tenantId}/sites/${siteId}/packages/${id}/edit`

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
            <Button size="sm" onClick={() => router.push(newHref)}>
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
              onEdit={() => router.push(editHref(pkg.id))}
              onDelete={() => setDeleteTarget(pkg.id)}
              onToggle={() => handleToggle(pkg)}
              selected={selected.has(pkg.id)}
              onSelect={(checked) => toggleSelect(pkg.id, checked)}
            />
          ))}
        </div>
      )}

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
