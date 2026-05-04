import { mockRadiusConfigs } from '@/lib/mock-data/radius'
import type { RadiusConfig, UpdateRadiusConfigInput } from '@/lib/types/radius.types'

let configs = [...mockRadiusConfigs]

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const DEFAULT_RADIUS: Omit<RadiusConfig, 'id' | 'siteId' | 'updatedAt'> = {
  serverHost: '',
  authPort: 1812,
  acctPort: 1813,
  secret: '',
  timeout: 5,
  retries: 3,
  nasIdentifier: '',
}

export const radiusService = {
  async getBySiteId(siteId: string): Promise<RadiusConfig> {
    await delay()
    return (
      configs.find((c) => c.siteId === siteId) ?? {
        id: `radius_${siteId}`,
        siteId,
        ...DEFAULT_RADIUS,
        updatedAt: new Date().toISOString(),
      }
    )
  },

  async update(siteId: string, input: UpdateRadiusConfigInput): Promise<RadiusConfig> {
    await delay()
    const existing = configs.find((c) => c.siteId === siteId)
    const updated: RadiusConfig = existing
      ? { ...existing, ...input, updatedAt: new Date().toISOString() }
      : { id: `radius_${siteId}`, siteId, ...input, updatedAt: new Date().toISOString() }
    configs = existing
      ? configs.map((c) => (c.siteId === siteId ? updated : c))
      : [...configs, updated]
    return updated
  },
}
