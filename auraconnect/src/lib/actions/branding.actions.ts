'use server'

import { brandingService } from '@/lib/services/branding.service'
import type { UpdateBrandingInput } from '@/lib/types/branding.types'

export async function updateBrandingAction(siteId: string, input: UpdateBrandingInput) {
  return brandingService.update(siteId, input)
}
