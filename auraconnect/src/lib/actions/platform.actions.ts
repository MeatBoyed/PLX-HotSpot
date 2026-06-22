'use server'

import { platformApi } from '@/lib/infrastructure/api/platform.api'
import type { components } from '@/lib/infrastructure/api/schema'

type UpdatePayFastInput = components['schemas']['UpdatePayFastSettingsRequest']
type UpdateMikroTikInput = components['schemas']['UpdateMikroTikSettingsRequest']

export async function updatePayFastSettingsAction(input: UpdatePayFastInput) {
  return platformApi.updatePayFastSettings(input)
}

export async function updateMikroTikSettingsAction(input: UpdateMikroTikInput) {
  return platformApi.updateMikroTikSettings(input)
}
