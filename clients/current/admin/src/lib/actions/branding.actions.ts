'use server'

import { brandingService } from '@/lib/services/branding.service'
import { brandingApi } from '@/lib/infrastructure/api/branding.api'
import { BrandingImageType } from '@/lib/infrastructure/api/types'
import type { UpdateBrandingInput } from '@/lib/types/branding.types'

export async function updateBrandingAction(siteId: string, input: UpdateBrandingInput) {
  return brandingService.update(siteId, input)
}

export async function uploadBrandingImageAction(
  siteId: string,
  imageType: BrandingImageType,
  formData: FormData,
): Promise<string> {
  const file = formData.get('file') as File
  await brandingApi.uploadImage(siteId, imageType, file)
  return brandingApi.getImageUrl(siteId, imageType)
}
