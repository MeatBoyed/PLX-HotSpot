import { SITE_METRICS, generateConnectionData, mockTopPackages, mockRecentActivity } from '@/lib/mock-data/dashboard'
import { mockSites } from '@/lib/mock-data/sites'
import { mockTenants } from '@/lib/mock-data/tenants'
import type { GlobalMetrics, TenantMetrics, SiteMetrics, ConnectionDataPoint, PackageUsage, ActivityEntry } from '@/lib/types/dashboard.types'

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const dashboardService = {
  async getGlobalMetrics(): Promise<GlobalMetrics> {
    await delay()
    const allSiteMetrics = Object.entries(SITE_METRICS).map(([siteId, m]) => ({
      siteId,
      ...m,
      totalUsersAllTime: m.newUsersToday * 30 + Math.floor(Math.random() * 500),
    })) satisfies SiteMetrics[]

    const tenantMetrics: TenantMetrics[] = mockTenants.map((t) => {
      const tenantSiteIds = mockSites.filter((s) => s.tenantId === t.id).map((s) => s.id)
      const sm = allSiteMetrics.filter((s) => tenantSiteIds.includes(s.siteId))
      return {
        tenantId: t.id,
        totalActiveConnections: sm.reduce((acc, s) => acc + s.activeConnections, 0),
        totalNewUsersToday: sm.reduce((acc, s) => acc + s.newUsersToday, 0),
        totalDataUsageGb: parseFloat(sm.reduce((acc, s) => acc + s.dataUsageGb, 0).toFixed(1)),
        siteMetrics: sm,
      }
    })

    return {
      totalActiveConnections: tenantMetrics.reduce((acc, t) => acc + t.totalActiveConnections, 0),
      totalNewUsersToday: tenantMetrics.reduce((acc, t) => acc + t.totalNewUsersToday, 0),
      totalDataUsageGb: parseFloat(tenantMetrics.reduce((acc, t) => acc + t.totalDataUsageGb, 0).toFixed(1)),
      totalTenants: mockTenants.length,
      totalSites: mockSites.length,
      tenantMetrics,
    }
  },

  async getTenantMetrics(tenantId: string): Promise<TenantMetrics> {
    await delay()
    const tenantSiteIds = mockSites.filter((s) => s.tenantId === tenantId).map((s) => s.id)
    const sm: SiteMetrics[] = tenantSiteIds.map((siteId) => ({
      siteId,
      ...(SITE_METRICS[siteId] ?? { activeConnections: 0, newUsersToday: 0, dataUsageGb: 0 }),
      totalUsersAllTime: (SITE_METRICS[siteId]?.newUsersToday ?? 0) * 30 + Math.floor(Math.random() * 200),
    }))
    return {
      tenantId,
      totalActiveConnections: sm.reduce((acc, s) => acc + s.activeConnections, 0),
      totalNewUsersToday: sm.reduce((acc, s) => acc + s.newUsersToday, 0),
      totalDataUsageGb: parseFloat(sm.reduce((acc, s) => acc + s.dataUsageGb, 0).toFixed(1)),
      siteMetrics: sm,
    }
  },

  async getSiteMetrics(siteId: string): Promise<SiteMetrics> {
    await delay()
    const m = SITE_METRICS[siteId] ?? { activeConnections: 0, newUsersToday: 0, dataUsageGb: 0 }
    return {
      siteId,
      ...m,
      totalUsersAllTime: m.newUsersToday * 30 + Math.floor(Math.random() * 500),
    }
  },

  async getConnectionData(siteId: string): Promise<ConnectionDataPoint[]> {
    await delay()
    return generateConnectionData(siteId)
  },

  async getTopPackages(): Promise<PackageUsage[]> {
    await delay()
    return mockTopPackages
  },

  async getRecentActivity(): Promise<ActivityEntry[]> {
    await delay()
    return mockRecentActivity
  },
}
