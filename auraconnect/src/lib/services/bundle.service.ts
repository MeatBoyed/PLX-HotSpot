import { mockBundles } from '@/lib/mock-data/bundles'
import type { Bundle } from '@/lib/types/bundle.types'

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const bundleService = {
  async getBySiteId(siteId: string): Promise<Bundle[]> {
    await delay()
    return mockBundles.filter((b) => b.siteId === siteId && b.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getByTenantId(tenantId: string): Promise<Bundle[]> {
    await delay()
    return mockBundles.filter((b) => b.tenantId === tenantId && b.isActive)
  },
}
