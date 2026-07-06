import { apiClient } from './client'
import type { components } from './schema'

type GatewayStatusResponse = components['schemas']['MikroTikGatewayStatusResponse']
type NetworkStatusResponse = components['schemas']['MikroTikNetworkStatusResponse']

export const mikrotikApi = {
  async getGatewayStatus(siteId: string): Promise<GatewayStatusResponse | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/mikrotik/status', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (response.status === 502) throw new Error('Could not reach the MikroTik router (bad gateway)')
    if (!response.ok) throw new Error(`Failed to fetch MikroTik gateway status: ${response.status}`)
    return (data as unknown as GatewayStatusResponse) ?? null
  },

  async getNetworkStatus(siteId: string): Promise<NetworkStatusResponse | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/mikrotik/network', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (response.status === 502) throw new Error('Could not reach the MikroTik router (bad gateway)')
    if (!response.ok) throw new Error(`Failed to fetch MikroTik network status: ${response.status}`)
    return (data as unknown as NetworkStatusResponse) ?? null
  },
}
