import type { MikroTikGatewayHealthStatus, MikroTikNetworkHealthStatus } from '@/lib/types/mikrotik.types'

export type HealthSeverity = 'ok' | 'error'

interface StatusInfo {
  label: string
  description: string
  severity: HealthSeverity
}

export const GATEWAY_STATUS_INFO: Record<MikroTikGatewayHealthStatus, StatusInfo> = {
  Healthy: {
    label: 'Healthy',
    description: 'Gateway configuration is healthy.',
    severity: 'ok',
  },
  GatewayUrlNotConfigured: {
    label: 'Gateway URL not configured',
    description: 'No gateway URL is set for this site. Set one in the RADIUS tab.',
    severity: 'error',
  },
  ProfileNotFound: {
    label: 'Profile not found',
    description: 'No hotspot profile on the MikroTik router matches this gateway URL.',
    severity: 'error',
  },
  ServerNotFound: {
    label: 'Server not found',
    description: 'The hotspot server referenced by the profile could not be found on the router.',
    severity: 'error',
  },
  CertificateNotFound: {
    label: 'Certificate not found',
    description: 'The SSL certificate referenced by the profile could not be found on the router.',
    severity: 'error',
  },
  CertificateExpired: {
    label: 'Certificate expired',
    description: 'The SSL certificate for this gateway has expired.',
    severity: 'error',
  },
  RadiusNotEnabled: {
    label: 'RADIUS not enabled',
    description: 'RADIUS authentication is not enabled on this hotspot profile.',
    severity: 'error',
  },
}

export const NETWORK_STATUS_INFO: Record<MikroTikNetworkHealthStatus, StatusInfo> = {
  Healthy: {
    label: 'Healthy',
    description: 'Network configuration is healthy.',
    severity: 'ok',
  },
  GatewayUrlNotConfigured: {
    label: 'Gateway URL not configured',
    description: 'No gateway URL is set for this site. Set one in the RADIUS tab.',
    severity: 'error',
  },
  ProfileNotFound: {
    label: 'Profile not found',
    description: 'No hotspot profile on the MikroTik router matches this gateway URL.',
    severity: 'error',
  },
  ServerNotFound: {
    label: 'Server not found',
    description: 'The hotspot server referenced by the profile could not be found on the router.',
    severity: 'error',
  },
  IpAddressNotFound: {
    label: 'IP address not found',
    description: 'No IP address is configured on the hotspot interface.',
    severity: 'error',
  },
  PoolNotFound: {
    label: 'Pool not found',
    description: 'The IP address pool referenced by the server could not be found.',
    severity: 'error',
  },
  DhcpServerNotFound: {
    label: 'DHCP server not found',
    description: 'No DHCP server was found for this interface.',
    severity: 'error',
  },
  DhcpServerPoolMismatch: {
    label: 'DHCP server pool mismatch',
    description: "The DHCP server's address pool does not match the hotspot server's pool.",
    severity: 'error',
  },
  DhcpNetworkNotFound: {
    label: 'DHCP network not found',
    description: "No DHCP network was found matching the interface's subnet.",
    severity: 'error',
  },
  DhcpGatewayMismatch: {
    label: 'DHCP gateway mismatch',
    description: "The DHCP network's gateway does not match the interface's IP address.",
    severity: 'error',
  },
  NotInFirewallList: {
    label: 'Not in firewall list',
    description: 'The hotspot network is not in the expected firewall address list.',
    severity: 'error',
  },
}

/** Extracts the hostname from a URL, falling back to the raw string if parsing fails. */
function hostnameOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

/** Whether `hostname` matches a literal SAN entry or a `*.domain` wildcard entry. */
function matchesSan(hostname: string, san: string): boolean {
  const s = san.toLowerCase()
  if (s === hostname) return true
  if (s.startsWith('*.')) {
    const suffix = s.slice(1) // ".domain.tld"
    return hostname.endsWith(suffix) && hostname.slice(0, -suffix.length).length > 0
  }
  return false
}

/** Checks whether the gateway URL's hostname is covered by the certificate (CN or SAN, incl. wildcards). */
export function isHostnameCoveredByCertificate(
  gatewayUrl: string | null,
  commonName: string | null,
  subjectAlternativeNames: string[],
): boolean | null {
  const hostname = hostnameOf(gatewayUrl)
  if (!hostname) return null
  if (commonName && matchesSan(hostname, commonName)) return true
  return subjectAlternativeNames.some((san) => matchesSan(hostname, san))
}

/** Checks whether the gateway URL's hostname matches the profile's configured DNS name. */
export function hostnameMatchesDnsName(gatewayUrl: string | null, dnsName: string | null): boolean | null {
  const hostname = hostnameOf(gatewayUrl)
  if (!hostname || !dnsName) return null
  return hostname === dnsName.toLowerCase()
}
