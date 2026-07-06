import { apiClient } from '@/infrastructure/http'
import { normalizeBranding } from '@/lib/utils/branding-normalize'
import type { BrandingConfig } from '@/lib/types'
import type { ApiPortalSubVenue } from '../types'

function toAppBranding(v: ApiPortalSubVenue): BrandingConfig {
  return normalizeBranding({
    ssid: v.ssid,
    name: v.name,
    venueLabel: v.venueLabel ?? null,
    venueRoute: v.venueRoute ?? null,
    sortOrder: v.sortOrder ?? undefined,
    parentSsid: v.parentSsid ?? null,
  })
}

export const portalSubVenuesApi = {
  async list(parentSsid: string): Promise<BrandingConfig[]> {
    const data = await apiClient.get<ApiPortalSubVenue[]>('/portal/sub-venues', { ssid: parentSsid })
    return (data ?? []).map(toAppBranding)
  },
}
