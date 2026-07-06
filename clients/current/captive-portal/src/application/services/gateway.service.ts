import { portalGatewayApi } from '@/infrastructure/api/portal/gateway.api'
import { InMemoryCache } from '@/infrastructure/cache'
import type { GatewayConfig } from '@/lib/types'

const gatewayCache = new InMemoryCache<GatewayConfig>(10 * 60 * 1000) // 10 minutes

export class GatewayService {
  async get(ssid: string): Promise<GatewayConfig> {
    if (!ssid) throw new Error('SSID is required')
    return gatewayCache.getOrSet(`gateway:${ssid}`, () => portalGatewayApi.get(ssid))
  }
}

export const gatewayService = new GatewayService()
