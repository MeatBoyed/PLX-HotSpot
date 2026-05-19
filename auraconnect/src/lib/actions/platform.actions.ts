'use server'

import { platformApi } from '@/lib/infrastructure/api/platform.api'
import type { components } from '@/lib/infrastructure/api/schema'

type UpdatePayFastInput = components['schemas']['UpdatePayFastSettingsRequest']

export async function updatePayFastSettingsAction(input: UpdatePayFastInput) {
  return platformApi.updatePayFastSettings(input)
}
