'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PowerOff, Power } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateSiteStatusAction } from '@/lib/actions/sites.actions'
import type { SiteStatus } from '@/lib/types/site.types'

const STATUS_OPTIONS: { label: string; value: number; status: SiteStatus }[] = [
  { label: 'Active', value: 0, status: 'active' },
  { label: 'Maintenance', value: 1, status: 'maintenance' },
  { label: 'Suspended', value: 2, status: 'suspended' },
  { label: 'Inactive', value: 3, status: 'inactive' },
]

interface Props {
  siteId: string
  currentStatus: SiteStatus
}

export function SiteStatusToggle({ siteId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (value: number) => {
    setLoading(true)
    try {
      await updateSiteStatusAction(siteId, value)
      toast.success('Site status updated')
      router.refresh()
    } catch {
      toast.error('Failed to update site status')
    } finally {
      setLoading(false)
    }
  }

  const isActive = currentStatus === 'active'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive
            ? 'text-destructive border-destructive/30 hover:bg-destructive/5'
            : 'text-green-700 border-green-300 hover:bg-green-50'
        } disabled:opacity-50 disabled:pointer-events-none`}
      >
        {isActive
          ? <><PowerOff className="h-4 w-4" />{loading ? 'Updating…' : 'Deactivate'}</>
          : <><Power className="h-4 w-4" />{loading ? 'Updating…' : 'Set Status'}</>
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_OPTIONS.filter((o) => o.status !== currentStatus).map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => handleStatusChange(opt.value)}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
