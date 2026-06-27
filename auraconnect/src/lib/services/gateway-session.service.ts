import { gatewaySessionsApi } from '@/lib/infrastructure/api/gateway-sessions.api'
import type { GatewaySessionListParams as ApiParams } from '@/lib/infrastructure/api/gateway-sessions.api'
import type { components } from '@/lib/infrastructure/api/schema'
import type { GatewaySessionEvent, PagedGatewaySessions, GatewaySessionListParams } from '@/lib/types/gateway-session.types'

type ApiEvent = components['schemas']['GatewaySessionEventResponse']

function decodeMac(mac: string | null | undefined): string | null {
  if (!mac) return null
  try {
    return decodeURIComponent(mac)
  } catch {
    return mac
  }
}

function toGatewaySessionEvent(api: ApiEvent): GatewaySessionEvent {
  return {
    id: api.id ?? '',
    siteId: api.siteId ?? '',
    mac: decodeMac(api.mac),
    nasId: api.nasId ?? null,
    resolvedHost: api.resolvedHost ?? null,
    redirectUrl: api.redirectUrl ?? null,
    loginOutcome: api.loginOutcome ?? 'Pending',
    loginError: api.loginError ?? null,
    loginErrorOriginal: api.loginErrorOriginal ?? null,
    loginCompletedAt: api.loginCompletedAt ?? null,
    createdAt: api.createdAt ?? new Date().toISOString(),
  }
}

export const gatewaySessionService = {
  async getAll(params: GatewaySessionListParams = {}): Promise<PagedGatewaySessions> {
    const apiParams: ApiParams = {
      page: params.page,
      pageSize: params.pageSize,
      tenantId: params.tenantId,
      siteId: params.siteId,
      mac: params.mac,
      outcome: params.outcome,
      from: params.from,
      to: params.to,
    }
    const paged = await gatewaySessionsApi.getAll(apiParams)
    return {
      items: (paged.items ?? []).map(toGatewaySessionEvent),
      page: Number(paged.page ?? 1),
      pageSize: Number(paged.pageSize ?? 25),
      totalCount: Number(paged.totalCount ?? 0),
      totalPages: Number(paged.totalPages ?? 1),
      hasNextPage: paged.hasNextPage ?? false,
      hasPreviousPage: paged.hasPreviousPage ?? false,
    }
  },
}
