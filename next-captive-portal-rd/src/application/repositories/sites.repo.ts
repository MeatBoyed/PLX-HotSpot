import { portalSitesApi, type PortalSite } from '@/infrastructure/api'

export interface ISitesRepository {
  list(): Promise<PortalSite[]>
}

export class SitesRepository implements ISitesRepository {
  async list(): Promise<PortalSite[]> {
    return portalSitesApi.list()
  }
}
