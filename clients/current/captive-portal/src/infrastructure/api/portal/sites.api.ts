import { apiClient } from '@/infrastructure/http'
import { env } from '@/env'
import type { components } from '@/infrastructure/api/schema'

type PortalSiteResponse = components['schemas']['PortalSiteResponse']

export interface PortalSite {
  ssid: string
  displayName: string
  logoUrl: string | null
  sortOrder: number
}

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function toPortalSite(api: PortalSiteResponse): PortalSite {
  return {
    ssid: api.ssid ?? '',
    displayName: api.displayName ?? api.ssid ?? '',
    logoUrl: resolveImageUrl(api.logoUrl),
    sortOrder: typeof api.sortOrder === 'number' ? api.sortOrder : 0,
  }
}

export const portalSitesApi = {
  async list(): Promise<PortalSite[]> {
    const tenantId = env.TENANT_ID
    if (!tenantId) throw new Error('TENANT_ID is not configured')
    const data = await apiClient.get<PortalSiteResponse[]>(`/portal/${tenantId}/sites`)
    return data.map(toPortalSite).sort((a, b) => a.sortOrder - b.sortOrder)
  },
}
