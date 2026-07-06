import { apiClient } from './client'
import type { components } from './schema'
import type { ApiBranding, ApiAdsConfig, BrandingImageType } from './types'

type UpdateBrandingBody = components['schemas']['UpdateBrandingRequest']
type UpdateColorsBody = components['schemas']['UpdateColorsRequest']
type UpdateImagesBody = components['schemas']['UpdateImagesRequest']
type UpdateContentBody = components['schemas']['UpdateContentRequest']
type UpdateAdsBody = components['schemas']['UpdateAdsConfigRequest']

/**
 * Prepends NEXT_PUBLIC_API_URL for paths served by the API (/api/...).
 * Leaves full URLs and Next.js static asset paths (/public/...) untouched.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('/api/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5299'
    return `${apiUrl}${url}`
  }
  return url
}

export const brandingApi = {
  async getBranding(siteId: string): Promise<ApiBranding | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/branding', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch branding for site ${siteId}: ${response.status}`)
    return (data as unknown as ApiBranding) ?? null
  },

  async updateBranding(siteId: string, body: UpdateBrandingBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/branding', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update branding for site ${siteId}: ${response.status}`)
  },

  async updateColors(siteId: string, body: UpdateColorsBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/branding/colors', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update colors for site ${siteId}: ${response.status}`)
  },

  async updateImages(siteId: string, body: UpdateImagesBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/branding/images', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update images for site ${siteId}: ${response.status}`)
  },

  async uploadImage(siteId: string, imageType: BrandingImageType, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    const apiUrl = process.env.API_URL ?? 'http://localhost:5299'
    const response = await fetch(
      `${apiUrl}/api/admin/sites/${siteId}/branding/images/${imageType}`,
      { method: 'POST', body: formData }
    )
    if (!response.ok) throw new Error(`Failed to upload image for site ${siteId}: ${response.status}`)
  },

  getImageUrl(siteId: string, imageType: BrandingImageType): string {
    return `/api/sites/${siteId}/branding/images/${imageType}`
  },

  async updateContent(siteId: string, body: UpdateContentBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/branding/content', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) throw new Error(`Failed to update content for site ${siteId}: ${response.status}`)
  },

  async getAdsConfig(siteId: string): Promise<ApiAdsConfig | null> {
    const { data, response } = await apiClient.GET('/api/admin/sites/{siteId}/ads', {
      params: { path: { siteId } },
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to fetch ads config for site ${siteId}: ${response.status}`)
    return (data as unknown as ApiAdsConfig) ?? null
  },

  async updateAdsConfig(siteId: string, body: UpdateAdsBody): Promise<void> {
    const { response } = await apiClient.PUT('/api/admin/sites/{siteId}/ads', {
      params: { path: { siteId } },
      body,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to update ads config for site ${siteId}: ${response.status} — ${text}`)
    }
  },
}
