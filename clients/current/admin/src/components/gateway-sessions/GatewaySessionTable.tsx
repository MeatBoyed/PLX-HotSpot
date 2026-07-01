'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { OutcomeBadge } from './OutcomeBadge'
import { formatDateTime } from '@/lib/utils/formatters'
import type { GatewaySessionEvent } from '@/lib/types/gateway-session.types'

interface GatewaySessionTableProps {
  sessions: GatewaySessionEvent[]
  siteNameById?: Record<string, string>
  /** Hides the Site column when already scoped to a single site. */
  showSiteColumn?: boolean
}

function SessionDetail({ session, siteName, open, onClose }: {
  session: GatewaySessionEvent
  siteName?: string
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">{session.mac ?? 'Unknown device'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Outcome</p>
              <OutcomeBadge outcome={session.loginOutcome} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Site</p>
              <p className="text-sm">{siteName ?? session.siteId}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">MAC address</p>
              <p className="font-mono text-xs">{session.mac ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NAS ID</p>
              <p className="font-mono text-xs">{session.nasId ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved host</p>
              <p className="font-mono text-xs break-all">{session.resolvedHost ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Redirect URL</p>
              <p className="font-mono text-xs break-all">{session.redirectUrl ?? '—'}</p>
            </div>
          </div>

          {(session.loginError || session.loginErrorOriginal) && (
            <>
              <Separator />
              <div className="space-y-2">
                {session.loginError && (
                  <div>
                    <p className="text-xs text-muted-foreground">Login error</p>
                    <p className="text-xs text-destructive">{session.loginError}</p>
                  </div>
                )}
                {session.loginErrorOriginal && (
                  <div>
                    <p className="text-xs text-muted-foreground">Raw RADIUS error</p>
                    <p className="font-mono text-xs break-all text-destructive">{session.loginErrorOriginal}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-xs">{formatDateTime(session.createdAt)}</p>
            </div>
            {session.loginCompletedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xs">{formatDateTime(session.loginCompletedAt)}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Event ID</p>
            <p className="font-mono text-xs break-all">{session.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GatewaySessionTable({ sessions, siteNameById = {}, showSiteColumn = true }: GatewaySessionTableProps) {
  const [selected, setSelected] = useState<GatewaySessionEvent | null>(null)

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MAC</TableHead>
            {showSiteColumn && <TableHead>Site</TableHead>}
            <TableHead>Outcome</TableHead>
            <TableHead>Resolved Host</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showSiteColumn ? 6 : 5} className="text-center text-muted-foreground py-10">
                No gateway sessions found
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(s)}>
                <TableCell className="font-mono text-xs">{s.mac ?? '—'}</TableCell>
                {showSiteColumn && (
                  <TableCell className="text-sm truncate max-w-40">{siteNameById[s.siteId] ?? s.siteId}</TableCell>
                )}
                <TableCell><OutcomeBadge outcome={s.loginOutcome} /></TableCell>
                <TableCell className="font-mono text-xs truncate max-w-40">{s.resolvedHost ?? '—'}</TableCell>
                <TableCell className="text-xs text-destructive truncate max-w-40">{s.loginError ?? '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(s.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selected && (
        <SessionDetail
          session={selected}
          siteName={siteNameById[selected.siteId]}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
