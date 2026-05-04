import { mockBranding } from '@/lib/mock-data/branding'
import { DEFAULT_BRANDING } from '@/lib/types/branding.types'
import type { BrandingConfig, UpdateBrandingInput } from '@/lib/types/branding.types'

let configs = [...mockBranding]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const brandingService = {
  async getBySiteId(siteId: string): Promise<BrandingConfig> {
    await delay()
    const existing = configs.find((c) => c.siteId === siteId)
    if (existing) return existing
    // Return default config if none exists
    return {
      id: `brand_${siteId}`,
      siteId,
      ...DEFAULT_BRANDING,
      updatedAt: new Date().toISOString(),
    }
  },

  async update(siteId: string, input: UpdateBrandingInput): Promise<BrandingConfig> {
    await delay()
    const existing = configs.find((c) => c.siteId === siteId)
    const updated: BrandingConfig = existing
      ? { ...existing, ...input, updatedAt: new Date().toISOString() }
      : { id: `brand_${siteId}`, siteId, ...input, updatedAt: new Date().toISOString() }
    configs = existing
      ? configs.map((c) => (c.siteId === siteId ? updated : c))
      : [...configs, updated]
    return updated
  },
}
