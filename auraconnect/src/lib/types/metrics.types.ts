export interface UsageTrendPoint {
  date: string
  bytesIn: number
  bytesOut: number
  sessions: number
  uniqueUsers: number
}

export interface UsageTrend {
  granularity: string
  points: UsageTrendPoint[]
  unattributedBytes: number
}

export interface KpiSummary {
  totalDataGb: number
  totalSessions: number
  uniqueUsers: number
  newUsers: number
  returningUsers: number
}

export interface LeaderboardEntry {
  siteId: string
  siteName: string
  value: number
  rank: number
}

export interface SiteLeaderboard {
  metric: 'data' | 'sessions'
  entries: LeaderboardEntry[]
}

export interface ActiveSessionsBySite {
  siteId: string
  siteName: string
  activeCount: number
}

export interface ActiveSessions {
  checkedAt: string
  totalActive: number
  bySite: ActiveSessionsBySite[]
}

export interface FailureReason {
  reason: string
  count: number
}

export interface LoginHealth {
  totalAttempts: number
  successCount: number
  failureCount: number
  failuresByReason: FailureReason[]
}

export interface UnattributedStation {
  calledStationId: string
  sessions: number
  firstSeen: string
  lastSeen: string
  sampleUsernames: string[]
}

export interface UnattributedStations {
  entries: UnattributedStation[]
}
