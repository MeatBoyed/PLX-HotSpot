'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { updateUserRoleAction } from '@/lib/actions/users.actions'
import type { AdminUser, UserRole } from '@/lib/types/user.types'
import type { Tenant } from '@/lib/types/tenant.types'

interface UserPermissionsClientProps {
  user: AdminUser
  tenants: Tenant[]
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full access to all tenants, sites, and user management.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Restricted to the tenants assigned below.',
  },
]

export function UserPermissionsClient({ user, tenants }: UserPermissionsClientProps) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(user.role)
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(
    new Set(user.tenantIds)
  )
  const [saving, setSaving] = useState(false)

  const toggleTenant = (id: string) => {
    setSelectedTenantIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedTenantIds(new Set(tenants.map((t) => t.id)))
  const clearAll = () => setSelectedTenantIds(new Set())

  const canSave = role === 'super_admin' || selectedTenantIds.size > 0

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUserRoleAction(
        user.id,
        role,
        role === 'super_admin' ? [] : [...selectedTenantIds]
      )
      toast.success('Permissions saved')
      router.push('/admin/users')
    } catch {
      toast.error('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => router.push('/admin/users')}
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        User Management
      </Button>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Manage Permissions</h1>
      </div>

      {/* User card */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <Badge
          className="ml-auto shrink-0"
          variant={user.status === 'active' ? 'outline' : user.status === 'pending' ? 'secondary' : 'destructive'}
        >
          {user.status}
        </Badge>
      </div>

      <Separator />

      {/* Role selection */}
      <div className="space-y-3">
        <h2 className="font-semibold">Role</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => {
            const selected = role === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:bg-accent'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {selected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tenant access */}
      {role === 'admin' && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Tenant Access</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTenantIds.size} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>Select all</Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {tenants.map((tenant) => {
                const checked = selectedTenantIds.has(tenant.id)
                return (
                  <label
                    key={tenant.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors',
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleTenant(tenant.id)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-medium truncate">{tenant.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tenant.siteCount} site{tenant.siteCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            {selectedTenantIds.size === 0 && (
              <p className="text-sm text-destructive">Select at least one tenant before saving.</p>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          {saving ? 'Saving…' : 'Save Permissions'}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/users')}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
