import { apiClient } from '@/infrastructure/http'

export const portalMarketingApi = {
  async subscribe(ssid: string, email: string): Promise<void> {
    await apiClient.post<void>('/portal/marketing-optin', { ssid, email })
  },

  async unsubscribe(ssid: string, email: string): Promise<void> {
    await apiClient.post<void>('/portal/marketing-optin/unsubscribe', { ssid, email })
  },
}
