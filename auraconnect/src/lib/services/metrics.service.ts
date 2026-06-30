import { metricsApi } from '@/lib/infrastructure/api/metrics.api'
import type {
  UsageTrend,
  KpiSummary,
  SiteLeaderboard,
  ActiveSessions,
  LoginHealth,
  UnattributedStations,
} from '@/lib/types/metrics.types'

function toNumber(v: unknown): number {
  return typeof v === 'string' ? Number(v) : (v as number) ?? 0
}

function toKpi(raw: KpiSummary): KpiSummary {
  return {
    totalDataGb:   toNumber(raw.totalDataGb),
    totalSessions: toNumber(raw.totalSessions),
    uniqueUsers:   toNumber(raw.uniqueUsers),
    newUsers:      toNumber(raw.newUsers),
    returningUsers: toNumber(raw.returningUsers),
  }
}

function toTrend(raw: UsageTrend): UsageTrend {
  return {
    granularity: raw.granularity,
    unattributedBytes: toNumber(raw.unattributedBytes),
    points: (raw.points ?? []).map((p) => ({
      date:        p.date,
      bytesIn:     toNumber(p.bytesIn),
      bytesOut:    toNumber(p.bytesOut),
      sessions:    toNumber(p.sessions),
      uniqueUsers: toNumber(p.uniqueUsers),
    })),
  }
}

export const metricsService = {
  async getUsageTrend(params: { siteId?: string; tenantId?: string; from: string; to: string }): Promise<UsageTrend> {
    const raw = await metricsApi.getUsageTrend(params)
    return toTrend(raw)
  },

  async getKpiSummary(params: { siteId?: string; tenantId?: string; from: string; to: string }): Promise<KpiSummary> {
    const raw = await metricsApi.getKpiSummary(params)
    return toKpi(raw)
  },

  async getSiteLeaderboard(params: { from: string; to: string; metric?: string }): Promise<SiteLeaderboard> {
    const raw = await metricsApi.getSiteLeaderboard(params)
    return {
      metric: (raw.metric as 'data' | 'sessions') ?? 'data',
      entries: (raw.entries ?? []).map((e, i) => ({
        siteId:   e.siteId,
        siteName: e.siteName,
        value:    toNumber(e.value),
        rank:     toNumber(e.rank) || i + 1,
      })),
    }
  },

  async getActiveSessions(params?: { siteId?: string; tenantId?: string }): Promise<ActiveSessions> {
    return metricsApi.getActiveSessions(params)
  },

  async getLoginHealth(params: { siteId?: string; from: string; to: string }): Promise<LoginHealth> {
    const raw = await metricsApi.getLoginHealth(params)
    return {
      totalAttempts:    toNumber(raw.totalAttempts),
      successCount:     toNumber(raw.successCount),
      failureCount:     toNumber(raw.failureCount),
      failuresByReason: (raw.failuresByReason ?? []).map((r) => ({
        reason: r.reason,
        count:  toNumber(r.count),
      })),
    }
  },

  async getUnattributedStations(params: { from: string; to: string }): Promise<UnattributedStations> {
    const raw = await metricsApi.getUnattributedStations(params)
    return {
      entries: (raw.entries ?? []).map((e) => ({
        calledStationId: e.calledStationId,
        sessions:        toNumber(e.sessions),
        firstSeen:       e.firstSeen,
        lastSeen:        e.lastSeen,
        sampleUsernames: e.sampleUsernames ?? [],
      })),
    }
  },
}
