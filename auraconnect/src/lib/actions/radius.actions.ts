'use server'

import { radiusService } from '@/lib/services/radius.service'
import type { UpdateRadiusConfigInput } from '@/lib/types/radius.types'

export async function updateRadiusConfigAction(siteId: string, input: UpdateRadiusConfigInput) {
  return radiusService.update(siteId, input)
}
