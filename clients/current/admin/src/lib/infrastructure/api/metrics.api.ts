import { apiClient } from './client'
import type {
  UsageTrend,
  KpiSummary,
  SiteLeaderboard,
  ActiveSessions,
  LoginHealth,
  UnattributedStations,
} from '@/lib/types/metrics.types'

// All metrics endpoints return 200 with content?: never in the schema (untyped responses).
// We use raw response.json() with manual casting throughout.

export const metricsApi = {
  async getUsageTrend(params: {
    siteId?: string
    tenantId?: string
    from: string
    to: string
    granularity?: string
  }): Promise<UsageTrend> {
    const { response } = await apiClient.GET('/api/admin/metrics/usage-trend', {
      params: { query: params },
    })
    if (!response.ok) throw new Error(`Failed to fetch usage trend: ${response.status}`)
    return response.json() as Promise<UsageTrend>
  },

  async getKpiSummary(params: {
    siteId?: string
    tenantId?: string
    from: string
    to: string
  }): Promise<KpiSummary> {
    const { response } = await apiClient.GET('/api/admin/metrics/kpi-summary', {
      params: { query: params },
    })
    if (!response.ok) throw new Error(`Failed to fetch KPI summary: ${response.status}`)
    return response.json() as Promise<KpiSummary>
  },

  async getSiteLeaderboard(params: {
    from: string
    to: string
    metric?: string
  }): Promise<SiteLeaderboard> {
    const { response } = await apiClient.GET('/api/admin/metrics/site-leaderboard', {
      params: { query: params },
    })
    if (!response.ok) throw new Error(`Failed to fetch site leaderboard: ${response.status}`)
    return response.json() as Promise<SiteLeaderboard>
  },

  async getActiveSessions(params?: {
    siteId?: string
    tenantId?: string
  }): Promise<ActiveSessions> {
    const { response } = await apiClient.GET('/api/admin/metrics/active-sessions', {
      params: { query: params ?? {} },
    })
    if (!response.ok) throw new Error(`Failed to fetch active sessions: ${response.status}`)
    return response.json() as Promise<ActiveSessions>
  },

  async getLoginHealth(params: {
    siteId?: string
    from: string
    to: string
  }): Promise<LoginHealth> {
    const { response } = await apiClient.GET('/api/admin/metrics/login-health', {
      params: { query: params },
    })
    if (!response.ok) throw new Error(`Failed to fetch login health: ${response.status}`)
    return response.json() as Promise<LoginHealth>
  },

  async getUnattributedStations(params: {
    from: string
    to: string
  }): Promise<UnattributedStations> {
    const { response } = await apiClient.GET('/api/admin/metrics/unattributed-stations', {
      params: { query: params },
    })
    if (!response.ok) throw new Error(`Failed to fetch unattributed stations: ${response.status}`)
    return response.json() as Promise<UnattributedStations>
  },
}
