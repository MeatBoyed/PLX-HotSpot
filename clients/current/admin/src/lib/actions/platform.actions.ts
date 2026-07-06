'use server'

import { platformApi } from '@/lib/infrastructure/api/platform.api'
import type { components } from '@/lib/infrastructure/api/schema'

type UpdatePayFastInput = components['schemas']['UpdatePayFastSettingsRequest']
type UpdateMikroTikInput = components['schemas']['UpdateMikroTikSettingsRequest']
type UpdateRadiusDbInput = components['schemas']['UpdateRadiusDbSettingsRequest']

export async function updatePayFastSettingsAction(input: UpdatePayFastInput) {
  return platformApi.updatePayFastSettings(input)
}

export async function updateMikroTikSettingsAction(input: UpdateMikroTikInput) {
  return platformApi.updateMikroTikSettings(input)
}

export async function updateRadiusDbSettingsAction(input: UpdateRadiusDbInput) {
  return platformApi.updateRadiusDbSettings(input)
}
