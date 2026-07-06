export type MikroTikGatewayHealthStatus =
  | 'GatewayUrlNotConfigured'
  | 'ProfileNotFound'
  | 'ServerNotFound'
  | 'CertificateNotFound'
  | 'CertificateExpired'
  | 'RadiusNotEnabled'
  | 'Healthy'

export type MikroTikNetworkHealthStatus =
  | 'GatewayUrlNotConfigured'
  | 'ProfileNotFound'
  | 'ServerNotFound'
  | 'IpAddressNotFound'
  | 'PoolNotFound'
  | 'DhcpServerNotFound'
  | 'DhcpServerPoolMismatch'
  | 'DhcpNetworkNotFound'
  | 'DhcpGatewayMismatch'
  | 'NotInFirewallList'
  | 'Healthy'

export interface MikroTikProfileInfo {
  name: string | null
  dnsName: string | null
  hotspotAddress: string | null
  htmlDirectory: string | null
  htmlDirectoryOverride: string | null
  useRadius: boolean
  radiusAccounting: boolean
  radiusInterimUpdate: string | null
  sslCertificateName: string | null
}

export interface MikroTikCertificateInfo {
  name: string | null
  commonName: string | null
  isExpired: boolean
  expiryDate: string | null
  daysUntilExpiry: number | null
  subjectAlternativeNames: string[]
}

export interface MikroTikServerInfo {
  name: string | null
  interface: string | null
  addressPool: string | null
  idleTimeout: string | null
}

export interface MikroTikGatewayStatus {
  siteId: string
  gatewayUrl: string | null
  status: MikroTikGatewayHealthStatus
  profile: MikroTikProfileInfo | null
  certificate: MikroTikCertificateInfo | null
  server: MikroTikServerInfo | null
  checkedAt: string
}

export interface MikroTikIpAddressInfo {
  address: string | null
  network: string | null
}

export interface MikroTikPoolInfo {
  name: string | null
  ranges: string | null
  total: number | null
  used: number | null
  available: number | null
}

export interface MikroTikDhcpServerInfo {
  name: string | null
  leaseTime: string | null
  addressPool: string | null
  disabled: boolean
  addressPoolMatchesServer: boolean
}

export interface MikroTikDhcpNetworkInfo {
  address: string | null
  gateway: string | null
  dnsServer: string | null
  gatewayMatchesAddress: boolean
}

export interface MikroTikFirewallEntry {
  list: string | null
  address: string | null
  creationTime: string | null
}

export interface MikroTikFirewallInfo {
  expectedList: string | null
  isListed: boolean
  matchingEntries: MikroTikFirewallEntry[]
}

export interface MikroTikNetworkStatus {
  siteId: string
  status: MikroTikNetworkHealthStatus
  interface: string | null
  ipAddress: MikroTikIpAddressInfo | null
  pool: MikroTikPoolInfo | null
  dhcpServer: MikroTikDhcpServerInfo | null
  dhcpNetwork: MikroTikDhcpNetworkInfo | null
  firewall: MikroTikFirewallInfo | null
  checkedAt: string
}
