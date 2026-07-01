import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { PackageUsage } from '@/lib/types/dashboard.types'

export function TopPackagesList({ packages }: { packages: PackageUsage[] }) {
  const max = Math.max(...packages.map((p) => p.count), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Top Packages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.packageId} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium truncate max-w-[180px]">{pkg.packageName}</span>
              <span className="text-muted-foreground text-xs ml-2 shrink-0">{pkg.count} uses</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(pkg.count / max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{pkg.siteName} · {formatCurrency(pkg.revenue)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
