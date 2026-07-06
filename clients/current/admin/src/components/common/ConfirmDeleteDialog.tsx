'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "tenant", "site", etc. — used in titles and messages. */
  entityType: string
  /** Exact string the user must type to proceed. */
  name: string
  /**
   * If provided, the delete flow is replaced with a blocking message
   * explaining why deletion isn't possible right now.
   */
  blockedReason?: string
  onConfirm: () => void
  isPending: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  entityType,
  name,
  blockedReason,
  onConfirm,
  isPending,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [typed, setTyped] = useState('')

  // Reset to step 1 every time the dialog opens.
  useEffect(() => {
    if (open) {
      setStep(1)
      setTyped('')
    }
  }, [open])

  function close() {
    if (!isPending) onOpenChange(false)
  }

  const matched = typed === name

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isPending) onOpenChange(o) }}>
      <DialogContent className="max-w-md">

        {/* ── Blocked state ── */}
        {blockedReason ? (
          <>
            <DialogHeader>
              <DialogTitle>Cannot delete {entityType}</DialogTitle>
              <DialogDescription>{blockedReason}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Close</Button>
            </DialogFooter>
          </>

        /* ── Step 1: type the name ── */
        ) : step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="capitalize">Delete {entityType}</DialogTitle>
              <DialogDescription>
                Type the {entityType} name exactly as shown to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Label className="text-sm">
                Type{' '}
                <span className="font-semibold text-foreground select-all">{name}</span>
                {' '}to continue
              </Label>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={name}
                autoComplete="off"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!matched}>
                Next
              </Button>
            </DialogFooter>
          </>

        /* ── Step 2: final warning ── */
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
            </DialogHeader>

            <div className="flex gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                This action is <strong>irreversible</strong>. Deleting{' '}
                <strong>{name}</strong> will permanently remove it and all
                associated data. There is no way to recover it.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>
                Back
              </Button>
              <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                {isPending ? 'Deleting…' : 'Confirm delete'}
              </Button>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  )
}
