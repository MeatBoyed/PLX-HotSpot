import { apiClient } from './client'
import type { components } from './schema'

export interface GatewaySessionListParams {
  page?: number
  pageSize?: number
  tenantId?: string
  siteId?: string
  mac?: string
  outcome?: components['schemas']['GatewayLoginOutcome']
  from?: string
  to?: string
}

type PagedResponse = components['schemas']['PagedResultOfGatewaySessionEventResponse']

export const gatewaySessionsApi = {
  async getAll(params: GatewaySessionListParams = {}): Promise<PagedResponse> {
    const { data, response } = await apiClient.GET('/api/admin/gateway-sessions', {
      params: {
        query: {
          page: params.page,
          pageSize: params.pageSize,
          tenantId: params.tenantId,
          siteId: params.siteId,
          mac: params.mac,
          outcome: params.outcome,
          from: params.from,
          to: params.to,
        },
      },
    })
    if (!response.ok) throw new Error(`Failed to fetch gateway sessions: ${response.status}`)
    return data as unknown as PagedResponse
  },
}
