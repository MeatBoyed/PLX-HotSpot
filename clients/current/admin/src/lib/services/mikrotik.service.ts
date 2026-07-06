import { mikrotikApi } from '@/lib/infrastructure/api/mikrotik.api'
import type { components } from '@/lib/infrastructure/api/schema'
import type { MikroTikGatewayStatus, MikroTikNetworkStatus } from '@/lib/types/mikrotik.types'

type ApiGatewayStatus = components['schemas']['MikroTikGatewayStatusResponse']
type ApiNetworkStatus = components['schemas']['MikroTikNetworkStatusResponse']

function toGatewayStatus(api: ApiGatewayStatus): MikroTikGatewayStatus {
  return {
    siteId: api.siteId ?? '',
    gatewayUrl: api.gatewayUrl ?? null,
    status: (api.status ?? 'Healthy') as MikroTikGatewayStatus['status'],
    profile: api.profile ? {
      name: api.profile.name ?? null,
      dnsName: api.profile.dnsName ?? null,
      hotspotAddress: api.profile.hotspotAddress ?? null,
      htmlDirectory: api.profile.htmlDirectory ?? null,
      htmlDirectoryOverride: api.profile.htmlDirectoryOverride ?? null,
      useRadius: api.profile.useRadius ?? false,
      radiusAccounting: api.profile.radiusAccounting ?? false,
      radiusInterimUpdate: api.profile.radiusInterimUpdate ?? null,
      sslCertificateName: api.profile.sslCertificateName ?? null,
    } : null,
    certificate: api.certificate ? {
      name: api.certificate.name ?? null,
      commonName: api.certificate.commonName ?? null,
      isExpired: api.certificate.isExpired ?? false,
      expiryDate: api.certificate.expiryDate ?? null,
      daysUntilExpiry: api.certificate.daysUntilExpiry != null ? Number(api.certificate.daysUntilExpiry) : null,
      subjectAlternativeNames: api.certificate.subjectAlternativeNames ?? [],
    } : null,
    server: api.server ? {
      name: api.server.name ?? null,
      interface: api.server.interface ?? null,
      addressPool: api.server.addressPool ?? null,
      idleTimeout: api.server.idleTimeout ?? null,
    } : null,
    checkedAt: api.checkedAt ?? new Date().toISOString(),
  }
}

function toNetworkStatus(api: ApiNetworkStatus): MikroTikNetworkStatus {
  return {
    siteId: api.siteId ?? '',
    status: (api.status ?? 'Healthy') as MikroTikNetworkStatus['status'],
    interface: api.interface ?? null,
    ipAddress: api.ipAddress ? {
      address: api.ipAddress.address ?? null,
      network: api.ipAddress.network ?? null,
    } : null,
    pool: api.pool ? {
      name: api.pool.name ?? null,
      ranges: api.pool.ranges ?? null,
      total: api.pool.total != null ? Number(api.pool.total) : null,
      used: api.pool.used != null ? Number(api.pool.used) : null,
      available: api.pool.available != null ? Number(api.pool.available) : null,
    } : null,
    dhcpServer: api.dhcpServer ? {
      name: api.dhcpServer.name ?? null,
      leaseTime: api.dhcpServer.leaseTime ?? null,
      addressPool: api.dhcpServer.addressPool ?? null,
      disabled: api.dhcpServer.disabled ?? false,
      addressPoolMatchesServer: api.dhcpServer.addressPoolMatchesServer ?? false,
    } : null,
    dhcpNetwork: api.dhcpNetwork ? {
      address: api.dhcpNetwork.address ?? null,
      gateway: api.dhcpNetwork.gateway ?? null,
      dnsServer: api.dhcpNetwork.dnsServer ?? null,
      gatewayMatchesAddress: api.dhcpNetwork.gatewayMatchesAddress ?? false,
    } : null,
    firewall: api.firewall ? {
      expectedList: api.firewall.expectedList ?? null,
      isListed: api.firewall.isListed ?? false,
      matchingEntries: (api.firewall.matchingEntries ?? []).map((e) => ({
        list: e.list ?? null,
        address: e.address ?? null,
        creationTime: e.creationTime ?? null,
      })),
    } : null,
    checkedAt: api.checkedAt ?? new Date().toISOString(),
  }
}

export const mikrotikService = {
  async getGatewayStatus(siteId: string): Promise<MikroTikGatewayStatus | null> {
    const api = await mikrotikApi.getGatewayStatus(siteId)
    return api ? toGatewayStatus(api) : null
  },

  async getNetworkStatus(siteId: string): Promise<MikroTikNetworkStatus | null> {
    const api = await mikrotikApi.getNetworkStatus(siteId)
    return api ? toNetworkStatus(api) : null
  },
}
