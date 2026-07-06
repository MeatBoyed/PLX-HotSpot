import { portalPackagesApi } from '@/infrastructure/api'
import type { ApiPortalPackage } from '@/infrastructure/api'

export interface IPackagesRepository {
    list(ssid: string): Promise<ApiPortalPackage[]>
}

export class PackagesRepository implements IPackagesRepository {
    constructor(private cache: any) {}

    async list(ssid: string): Promise<ApiPortalPackage[]> {
        const cacheKey = `packages:${ssid}`

        const cached = this.cache.get(cacheKey)
        if (cached) return cached

        return this.cache.getOrSet(cacheKey, () => portalPackagesApi.list(ssid))
    }
}
