export interface SiteMetrics {
  siteId: string
  activeConnections: number
  newUsersToday: number
  dataUsageGb: number
  totalUsersAllTime: number
}

export interface TenantMetrics {
  tenantId: string
  totalActiveConnections: number
  totalNewUsersToday: number
  totalDataUsageGb: number
  siteMetrics: SiteMetrics[]
}

export interface GlobalMetrics {
  totalActiveConnections: number
  totalNewUsersToday: number
  totalDataUsageGb: number
  totalTenants: number
  totalSites: number
  tenantMetrics: TenantMetrics[]
}

export interface ConnectionDataPoint {
  date: string
  connections: number
  label: string
}

export interface PackageUsage {
  packageId: string
  packageName: string
  siteId: string
  siteName: string
  count: number
  revenue: number
}

export interface ActivityEntry {
  id: string
  type: 'connection' | 'package_purchase' | 'user_signup' | 'config_change'
  message: string
  tenantId?: string
  siteId?: string
  timestamp: string
}
