import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Plain key/value row. */
export function DetailRow({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-right', mono && 'font-mono text-xs')}>{value ?? '—'}</span>
    </div>
  )
}

/**
 * Row with a check/cross/dash icon for boolean-ish comparisons.
 * `match === null` means "not applicable" — shown as a dash, not a failure.
 */
export function CheckRow({ label, match, value }: { label: string; match: boolean | null; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        {value && <span className="font-mono text-xs">{value}</span>}
        {match === null ? (
          <MinusCircle className="h-4 w-4 text-muted-foreground/50" />
        ) : match ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </span>
    </div>
  )
}
