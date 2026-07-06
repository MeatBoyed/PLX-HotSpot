import { sitesApi } from '@/lib/infrastructure/api/sites.api'

export const authMethodsService = {
  async getBySiteId(siteId: string): Promise<string[]> {
    const site = await sitesApi.getById(siteId)
    return site?.authMethods ?? []
  },

  async update(siteId: string, authMethods: string[]): Promise<void> {
    const site = await sitesApi.getById(siteId)
    if (!site) throw new Error(`Site ${siteId} not found`)
    await sitesApi.update(siteId, {
      ssid: site.ssid,
      name: site.name,
      domain: site.domain,
      sortOrder: site.sortOrder ?? undefined,
      authMethods,
    })
  },
}
