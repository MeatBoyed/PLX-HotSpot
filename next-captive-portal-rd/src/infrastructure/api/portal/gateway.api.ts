import { apiClient } from '@/infrastructure/http'
import { env } from '@/env'
import type { components } from '@/infrastructure/api/schema'
import type { GatewayConfig } from '@/lib/types'

type GatewayConfigResponse = components['schemas']['GatewayConfigResponse']

export const portalGatewayApi = {
  async get(ssid: string): Promise<GatewayConfig> {
    const tenantId = env.TENANT_ID
    if (!tenantId) throw new Error('TENANT_ID is not configured')
    const data = await apiClient.get<GatewayConfigResponse>(`/portal/${tenantId}/gateway`, { ssid })
    const raw = data.loginUrl ?? ''
    return {
      loginUrl: raw,
      freeUsername: data.freeUsername ?? '',
      freePassword: data.freePassword ?? '',
    }
  },
}
