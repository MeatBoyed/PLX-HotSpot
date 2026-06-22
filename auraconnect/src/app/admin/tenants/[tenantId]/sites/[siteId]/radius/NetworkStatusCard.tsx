import { Network, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HealthBadge } from './HealthBadge'
import { DetailRow, CheckRow } from './Rows'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { NETWORK_STATUS_INFO } from '@/lib/utils/mikrotik-status'
import type { MikroTikNetworkStatus } from '@/lib/types/mikrotik.types'

export function NetworkStatusCard({ data }: { data: MikroTikNetworkStatus }) {
  const info = NETWORK_STATUS_INFO[data.status]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Network Status</CardTitle>
          </div>
          <HealthBadge label={info.label} severity={info.severity} />
        </div>
        <p className="text-xs text-muted-foreground">
          Checked {formatRelativeTime(data.checkedAt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {info.severity === 'error' && (
          <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>{info.description}</p>
          </div>
        )}

        <div>
          <DetailRow label="Interface" value={data.interface} />
        </div>

        {data.ipAddress && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">IP Address</p>
              <DetailRow label="Address" value={data.ipAddress.address} />
              <DetailRow label="Network" value={data.ipAddress.network} />
            </div>
          </>
        )}

        {data.pool && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Address Pool</p>
              <DetailRow label="Pool name" value={data.pool.name} />
              <DetailRow label="Ranges" value={data.pool.ranges} />
              <DetailRow
                label="Capacity"
                value={
                  data.pool.used != null && data.pool.available != null
                    ? `${data.pool.used} used / ${data.pool.available} free / ${data.pool.total ?? '—'} total`
                    : data.pool.total != null
                    ? `${data.pool.total} total`
                    : '—'
                }
              />
            </div>
          </>
        )}

        {data.dhcpServer && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">DHCP Server</p>
              <DetailRow label="Server name" value={data.dhcpServer.name} />
              <DetailRow label="Lease time" value={data.dhcpServer.leaseTime} />
              <CheckRow
                label="Address pool matches hotspot server"
                match={data.dhcpServer.addressPoolMatchesServer}
                value={data.dhcpServer.addressPool}
              />
              <CheckRow label="Enabled" match={!data.dhcpServer.disabled} />
            </div>
          </>
        )}

        {data.dhcpNetwork && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">DHCP Network</p>
              <DetailRow label="Address" value={data.dhcpNetwork.address} />
              <CheckRow
                label="Gateway matches interface IP"
                match={data.dhcpNetwork.gatewayMatchesAddress}
                value={data.dhcpNetwork.gateway}
              />
              <DetailRow label="DNS server" value={data.dhcpNetwork.dnsServer} />
            </div>
          </>
        )}

        {data.firewall && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Firewall</p>
              <CheckRow
                label="Listed in expected address list"
                match={data.firewall.isListed}
                value={data.firewall.expectedList}
              />
              {data.firewall.matchingEntries.length > 0 && (
                <div className="rounded-md border mt-2 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">List</TableHead>
                        <TableHead className="text-xs">Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.firewall.matchingEntries.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{entry.list}</TableCell>
                          <TableCell className="text-xs font-mono">{entry.address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
