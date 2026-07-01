'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { AdminUser, UserRole } from '@/lib/types/user.types'
import type { Tenant } from '@/lib/types/tenant.types'

interface ManagePermissionsDialogProps {
  user: AdminUser
  tenants: Tenant[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: UserRole, tenantIds: string[]) => Promise<void>
}

export function ManagePermissionsDialog({
  user,
  tenants,
  open,
  onOpenChange,
  onSave,
}: ManagePermissionsDialogProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(
    new Set(user.tenantIds)
  )
  const [loading, setLoading] = useState(false)

  const toggleTenant = (id: string) => {
    setSelectedTenantIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(role, role === 'super_admin' ? [] : [...selectedTenantIds])
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Update role and tenant access for this user.
          </DialogDescription>
        </DialogHeader>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs font-medium">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <Separator />

        {/* Role */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Role</Label>
          <Select value={role} onValueChange={(v) => v && setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin — full access to all tenants</SelectItem>
              <SelectItem value="admin">Admin — restricted to assigned tenants</SelectItem>
            </SelectContent>
          </Select>
          {role === 'super_admin' && (
            <p className="text-xs text-muted-foreground">
              Super admins automatically have access to all tenants and user management.
            </p>
          )}
        </div>

        {/* Tenant access — only shown for admin role */}
        {role === 'admin' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tenant Access</Label>
            <p className="text-xs text-muted-foreground">Select which tenants this admin can manage.</p>
            <div className="space-y-2 rounded-lg border p-3 max-h-48 overflow-y-auto">
              {tenants.map((tenant) => (
                <label
                  key={tenant.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={selectedTenantIds.has(tenant.id)}
                    onCheckedChange={() => toggleTenant(tenant.id)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedTenantIds.size === 0 && (
              <p className="text-xs text-destructive">Select at least one tenant.</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || (role === 'admin' && selectedTenantIds.size === 0)}
          >
            {loading ? 'Saving…' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
