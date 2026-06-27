export type GatewayLoginOutcome = 'Pending' | 'Success' | 'Failed'

export interface GatewaySessionEvent {
  id: string
  siteId: string
  mac: string | null
  nasId: string | null
  resolvedHost: string | null
  redirectUrl: string | null
  loginOutcome: GatewayLoginOutcome
  loginError: string | null
  loginErrorOriginal: string | null
  loginCompletedAt: string | null
  createdAt: string
}

export interface PagedGatewaySessions {
  items: GatewaySessionEvent[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface GatewaySessionListParams {
  tenantId?: string
  siteId?: string
  mac?: string
  outcome?: GatewayLoginOutcome
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
