'use client'

import { Trash2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDuration, formatSpeed } from '@/lib/utils/formatters'
import type { Package } from '@/lib/types/package.types'

interface PackageCardProps {
  pkg: Package
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  selected?: boolean
  onSelect?: (checked: boolean) => void
}

export function PackageCard({ pkg, onEdit, onDelete, onToggle, selected, onSelect }: PackageCardProps) {
  return (
    <Card className={pkg.active ? '' : 'opacity-60'}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
              />
            )}
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pkg.description}</p>
              )}
            </div>
          </div>
          <Badge variant={pkg.active ? 'default' : 'secondary'} className="shrink-0">
            {pkg.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div><span className="text-muted-foreground">Price: </span><span className="font-medium">{pkg.price === 0 ? 'Free' : formatCurrency(pkg.price, pkg.currency)}</span></div>
          <div><span className="text-muted-foreground">Duration: </span><span className="font-medium">{formatDuration(pkg.durationValue, pkg.durationType)}</span></div>
          <div><span className="text-muted-foreground">Download: </span><span className="font-medium">{formatSpeed(pkg.downloadSpeedKbps)}</span></div>
          <div><span className="text-muted-foreground">RADIUS: </span><span className="font-medium font-mono truncate">{pkg.radiusProfile}</span></div>
        </div>

        <div className="flex gap-1 mt-3 justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onToggle} title={pkg.active ? 'Deactivate' : 'Activate'}>
            {pkg.active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
