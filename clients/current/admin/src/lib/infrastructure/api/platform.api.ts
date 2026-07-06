import { apiClient } from './client'
import type { components } from './schema'

type UpdatePayFastBody = components['schemas']['UpdatePayFastSettingsRequest']
type UpdateMikroTikBody = components['schemas']['UpdateMikroTikSettingsRequest']
type UpdateRadiusDbBody = components['schemas']['UpdateRadiusDbSettingsRequest']

export interface PlatformSettings {
  isPayFastConfigured: boolean
  payFastMerchantId: string | null
  isPayFastMerchantKeySet: boolean
  isPayFastPassPhraseSet: boolean
  payFastSandboxMode: boolean
  isMikroTikConfigured: boolean
  mikroTikApiHost: string | null
  mikroTikUsername: string | null
  isMikroTikPasswordSet: boolean
  isRadiusDbConfigured: boolean
  radiusDbHost: string | null
  radiusDbPort: number | null
  radiusDbName: string | null
  radiusDbUsername: string | null
  isRadiusDbPasswordSet: boolean
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
      isMikroTikConfigured: data.isMikroTikConfigured ?? false,
      mikroTikApiHost: data.mikroTikApiHost ?? null,
      mikroTikUsername: data.mikroTikUsername ?? null,
      isMikroTikPasswordSet: data.isMikroTikPasswordSet ?? false,
      isRadiusDbConfigured: data.isRadiusDbConfigured ?? false,
      radiusDbHost: data.radiusDbHost ?? null,
      radiusDbPort: data.radiusDbPort ?? null,
      radiusDbName: data.radiusDbName ?? null,
      radiusDbUsername: data.radiusDbUsername ?? null,
      isRadiusDbPasswordSet: data.isRadiusDbPasswordSet ?? false,
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

  async updateMikroTikSettings(body: UpdateMikroTikBody): Promise<void> {
    const { response } = await apiClient.PATCH('/api/admin/platform/settings/mikrotik', { body })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update MikroTik settings: ${response.status} — ${text}`)
    }
  },

  async updateRadiusDbSettings(body: UpdateRadiusDbBody): Promise<void> {
    const { response } = await apiClient.PATCH('/api/admin/platform/settings/radius-db', { body })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update RADIUS DB settings: ${response.status} — ${text}`)
    }
  },
}
