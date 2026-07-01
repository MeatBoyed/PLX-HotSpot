'use client'

import { Trash2, ToggleLeft, ToggleRight, Pencil, Clock, Database, Zap, Timer, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'
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
  const limits = [
    pkg.dataLimitEnabled && pkg.dataAmount != null && `${pkg.dataAmount}${pkg.dataUnit ?? ''}`,
    pkg.timeLimitEnabled && pkg.timeAmount != null && `${pkg.timeAmount}${pkg.timeUnit ?? ''}`,
    pkg.speedLimitEnabled && pkg.speedDownloadAmount != null && `↓${pkg.speedDownloadAmount}${pkg.speedDownloadUnit ?? ''}`,
    pkg.sessionLimitEnabled && pkg.sessionLimit != null && `${pkg.sessionLimit} sessions`,
  ].filter(Boolean) as string[]

  return (
    <Card className={pkg.isActive ? '' : 'opacity-60'}>
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
          <Badge variant={pkg.isActive ? 'default' : 'secondary'} className="shrink-0">
            {pkg.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground">Price: </span>
            <span className="font-medium">{pkg.price === 0 ? 'Free' : formatCurrency(pkg.price)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sort: </span>
            <span className="font-medium">#{pkg.sortOrder}</span>
          </div>
          {pkg.durationDays > 0 && (
            <div className="col-span-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Duration: </span>
              <span className="font-medium">{pkg.durationDays} day{pkg.durationDays !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-muted-foreground">RADIUS: </span>
            <span className="font-medium font-mono truncate">{pkg.radiusProfile}</span>
          </div>
        </div>

        {limits.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {pkg.dataLimitEnabled && pkg.dataAmount != null && (
              <Badge variant="outline" className="text-xs gap-1 font-normal">
                <Database className="h-2.5 w-2.5" />{pkg.dataAmount}{pkg.dataUnit ?? ''}
              </Badge>
            )}
            {pkg.timeLimitEnabled && pkg.timeAmount != null && (
              <Badge variant="outline" className="text-xs gap-1 font-normal">
                <Timer className="h-2.5 w-2.5" />{pkg.timeAmount}{pkg.timeUnit ?? ''}
              </Badge>
            )}
            {pkg.speedLimitEnabled && (pkg.speedDownloadAmount != null || pkg.speedUploadAmount != null) && (
              <Badge variant="outline" className="text-xs gap-1 font-normal">
                <Zap className="h-2.5 w-2.5" />
                {pkg.speedDownloadAmount != null && `↓${pkg.speedDownloadAmount}${pkg.speedDownloadUnit ?? ''}`}
                {pkg.speedUploadAmount != null && ` ↑${pkg.speedUploadAmount}${pkg.speedUploadUnit ?? ''}`}
              </Badge>
            )}
            {pkg.sessionLimitEnabled && pkg.sessionLimit != null && (
              <Badge variant="outline" className="text-xs gap-1 font-normal">
                <Users className="h-2.5 w-2.5" />{pkg.sessionLimit} sessions
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-1 mt-3 justify-end">
          <Button
            size="icon" variant="ghost" className="h-7 w-7"
            onClick={onToggle}
            title={pkg.isActive ? 'Deactivate' : 'Activate'}
          >
            {pkg.isActive
              ? <ToggleRight className="h-4 w-4 text-green-500" />
              : <ToggleLeft className="h-4 w-4" />
            }
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
