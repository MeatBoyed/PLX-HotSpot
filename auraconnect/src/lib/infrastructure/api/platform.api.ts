import { apiClient } from './client'
import type { components } from './schema'

type UpdatePayFastBody = components['schemas']['UpdatePayFastSettingsRequest']

export const platformApi = {
  async updatePayFastSettings(body: UpdatePayFastBody): Promise<void> {
    const { response } = await apiClient.PATCH('/api/admin/platform/settings/payfast', { body })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update PayFast settings: ${response.status} — ${text}`)
    }
  },
}
