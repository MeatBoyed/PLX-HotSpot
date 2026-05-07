'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface WalletAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalanceCents: number
  userName: string
  onSave: (amountCents: number, reason: string) => Promise<void>
}

export function WalletAdjustDialog({ open, onOpenChange, currentBalanceCents, userName, onSave }: WalletAdjustDialogProps) {
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit')
  const [amountRand, setAmountRand] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const amountCents = Math.round(parseFloat(amountRand || '0') * 100)
  const finalCents = direction === 'credit' ? amountCents : -amountCents
  const newBalance = Math.max(0, currentBalanceCents + finalCents)
  const valid = amountCents > 0 && reason.trim().length > 0

  const handleSave = async () => {
    if (!valid) return
    setLoading(true)
    try {
      await onSave(finalCents, reason.trim())
      setAmountRand('')
      setReason('')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Manual Wallet Adjustment
          </DialogTitle>
          <DialogDescription>Adjust wallet balance for {userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Current balance</span>
            <span className="font-semibold">{formatCurrency(currentBalanceCents / 100)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['credit', 'debit'] as const).map((d) => (
              <button key={d} type="button" onClick={() => setDirection(d)}
                className={`rounded-lg border p-3 text-sm font-medium capitalize transition-colors ${
                  direction === d ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent'
                }`}>
                {d === 'credit' ? '＋ Add credit' : '－ Deduct'}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Amount (ZAR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R</span>
              <Input className="pl-7" type="number" min="0.01" step="0.01" placeholder="0.00"
                value={amountRand} onChange={(e) => setAmountRand(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input placeholder="e.g. Goodwill credit, billing error correction…"
              value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          {amountCents > 0 && (
            <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
              <span className="text-muted-foreground">New balance</span>
              <span className="font-semibold">{formatCurrency(newBalance / 100)}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !valid}>
            {loading ? 'Saving…' : 'Apply Adjustment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
