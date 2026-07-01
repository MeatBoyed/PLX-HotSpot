import type { BrandingConfig } from '@/lib/types'
import { portalBrandingApi } from '@/infrastructure/api'

export interface IBrandingRepository {
    get(ssid: string): Promise<BrandingConfig>
    get(ssid: string, options: { bypassCache?: boolean }): Promise<BrandingConfig>
}

export class BrandingRepository implements IBrandingRepository {
    constructor(private cache: any) {}

    async get(ssid: string, options?: { bypassCache?: boolean }): Promise<BrandingConfig> {
        const cacheKey = `branding:${ssid}`

        if (!options?.bypassCache) {
            const cached = this.cache.get(cacheKey)
            if (cached) return cached
        }

        return this.cache.getOrSet(cacheKey, () => portalBrandingApi.get(ssid))
    }
}
