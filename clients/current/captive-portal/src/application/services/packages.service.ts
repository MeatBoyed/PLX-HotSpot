import { PackagesRepository } from '../repositories/packages.repo'
import { packageCache } from '@/infrastructure/cache'
import type { ApiPortalPackage } from '@/infrastructure/api'

export class PackagesService {
    private repository: PackagesRepository

    constructor() {
        this.repository = new PackagesRepository(packageCache)
    }

    async list(ssid: string): Promise<ApiPortalPackage[]> {
        if (!ssid) throw new Error('SSID is required')
        return this.repository.list(ssid)
    }

    async getByName(name: string, ssid: string): Promise<ApiPortalPackage | null> {
        if (!ssid) throw new Error('SSID is required')
        const packages = await this.repository.list(ssid)
        return packages.find(p => p.name === name) ?? null
    }
}

export const packagesService = new PackagesService()
