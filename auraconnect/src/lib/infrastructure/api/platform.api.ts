import { apiClient } from './client'
import type { components } from './schema'

type UpdatePayFastBody = components['schemas']['UpdatePayFastSettingsRequest']

export interface PlatformSettings {
  isPayFastConfigured: boolean
  payFastMerchantId: string | null
  isPayFastMerchantKeySet: boolean
  isPayFastPassPhraseSet: boolean
  payFastSandboxMode: boolean
  updatedAt: string | null
}

export const platformApi = {
  async getSettings(): Promise<PlatformSettings> {
    const { response } = await apiClient.GET('/api/admin/platform/settings', {})
    if (!response.ok) throw new Error(`Failed to fetch platform settings: ${response.status}`)
    const data = await response.json().catch(() => ({}))
    return {
      isPayFastConfigured: data.isPayFastConfigured ?? false,
      payFastMerchantId: data.payFastMerchantId ?? null,
      isPayFastMerchantKeySet: data.isPayFastMerchantKeySet ?? false,
      isPayFastPassPhraseSet: data.isPayFastPassPhraseSet ?? false,
      payFastSandboxMode: data.payFastSandboxMode ?? true,
      updatedAt: data.updatedAt ?? null,
    }
  },

  async updatePayFastSettings(body: UpdatePayFastBody): Promise<void> {
    const { response } = await apiClient.PATCH('/api/admin/platform/settings/payfast', { body })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update PayFast settings: ${response.status} — ${text}`)
    }
  },
}
