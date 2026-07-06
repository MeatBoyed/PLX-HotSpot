'use server'

import { adsService } from '@/lib/services/ads.service'
import type { UpdateAdsConfigInput } from '@/lib/types/ads.types'

export async function updateAdsConfigAction(siteId: string, input: UpdateAdsConfigInput): Promise<void> {
  return adsService.update(siteId, input)
}
