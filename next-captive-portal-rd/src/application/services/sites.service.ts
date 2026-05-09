import { SitesRepository } from '../repositories/sites.repo'
import type { PortalSite } from '@/infrastructure/api'

export class SitesService {
  private repository = new SitesRepository()

  async list(): Promise<PortalSite[]> {
    return this.repository.list()
  }
}

export const sitesService = new SitesService()
