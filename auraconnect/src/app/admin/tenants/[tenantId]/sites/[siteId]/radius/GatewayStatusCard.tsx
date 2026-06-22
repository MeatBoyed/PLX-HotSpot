import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { HealthBadge } from './HealthBadge'
import { DetailRow, CheckRow } from './Rows'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/formatters'
import { GATEWAY_STATUS_INFO, isHostnameCoveredByCertificate, hostnameMatchesDnsName } from '@/lib/utils/mikrotik-status'
import type { MikroTikGatewayStatus } from '@/lib/types/mikrotik.types'

export function GatewayStatusCard({ data }: { data: MikroTikGatewayStatus }) {
  const info = GATEWAY_STATUS_INFO[data.status]
  const dnsMatches = hostnameMatchesDnsName(data.gatewayUrl, data.profile?.dnsName ?? null)
  const certCovers = isHostnameCoveredByCertificate(
    data.gatewayUrl,
    data.certificate?.commonName ?? null,
    data.certificate?.subjectAlternativeNames ?? []
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Gateway Status</CardTitle>
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
          <DetailRow label="Gateway URL" value={data.gatewayUrl} />
        </div>

        {data.profile && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Hotspot Profile</p>
              <DetailRow label="Profile name" value={data.profile.name} />
              <CheckRow label="DNS name matches gateway URL" match={dnsMatches} value={data.profile.dnsName} />
              <DetailRow label="Hotspot address" value={data.profile.hotspotAddress} />
              <DetailRow label="HTML directory" value={data.profile.htmlDirectoryOverride || data.profile.htmlDirectory} />
              <CheckRow label="RADIUS enabled" match={data.profile.useRadius} />
              <CheckRow label="RADIUS accounting" match={data.profile.radiusAccounting} />
              <DetailRow label="RADIUS interim update" value={data.profile.radiusInterimUpdate} />
              <DetailRow label="SSL certificate name" value={data.profile.sslCertificateName} />
            </div>
          </>
        )}

        {data.certificate && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">SSL Certificate</p>
              <DetailRow label="Certificate name" value={data.certificate.name} />
              <DetailRow label="Common name" value={data.certificate.commonName} />
              <CheckRow label="Covers gateway hostname" match={certCovers} />
              <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
                <span className="text-muted-foreground">Expiry</span>
                <span className="text-right text-xs font-mono">
                  {data.certificate.expiryDate ? formatDateTime(data.certificate.expiryDate) : '—'}
                  {data.certificate.isExpired ? (
                    <Badge variant="outline" className="ml-2 bg-red-500/15 text-red-600 border-red-500/20">Expired</Badge>
                  ) : data.certificate.daysUntilExpiry != null && data.certificate.daysUntilExpiry <= 30 ? (
                    <Badge variant="outline" className="ml-2 bg-yellow-500/15 text-yellow-600 border-yellow-500/20">
                      {data.certificate.daysUntilExpiry}d left
                    </Badge>
                  ) : data.certificate.daysUntilExpiry != null ? (
                    <span className="ml-2 text-muted-foreground">({data.certificate.daysUntilExpiry}d left)</span>
                  ) : null}
                </span>
              </div>
              {data.certificate.subjectAlternativeNames.length > 0 && (
                <div className="pt-1.5">
                  <p className="text-xs text-muted-foreground mb-1.5">Subject alternative names</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.certificate.subjectAlternativeNames.map((san) => (
                      <Badge key={san} variant="secondary" className="font-mono text-[10px]">{san}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {data.server && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Hotspot Server</p>
              <DetailRow label="Server name" value={data.server.name} />
              <DetailRow label="Interface" value={data.server.interface} />
              <DetailRow label="Address pool" value={data.server.addressPool} />
              <DetailRow label="Idle timeout" value={data.server.idleTimeout} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
