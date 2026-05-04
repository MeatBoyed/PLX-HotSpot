/**
 * Branding Repository
 * Data access layer for branding configuration
 */

import { BrandingConfig } from '@/lib/types';
import type { ApiClient } from '@/infrastructure/http';
import { schemas } from '@/lib/hotspotAPI';

/**
 * IBrandingRepository - Port/Interface
 * Defines what operations are available for branding data
 */
export interface IBrandingRepository {
    /**
     * Get branding config for a site (SSID)
     */
    get(ssid: string): Promise<BrandingConfig>;

    /**
     * Get branding config with cache bypass
     */
    get(ssid: string, options: { bypassCache?: boolean }): Promise<BrandingConfig>;
}

/**
 * BrandingRepository - Implementation
 * Fetches from API and manages caching
 */
export class BrandingRepository implements IBrandingRepository {
    constructor(
        private apiClient: ApiClient,
        private cache: any
    ) { }

    async get(
        ssid: string,
        options?: { bypassCache?: boolean }
    ): Promise<BrandingConfig> {
        const cacheKey = `branding:${ssid}`;

        // Return from cache if available and not bypassed
        if (!options?.bypassCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        // Use cache deduplication to prevent concurrent requests
        return this.cache.getOrSet(cacheKey, async () => {
            const branding = await this.apiClient.get<unknown>('/portal/branding', { ssid });
            return schemas.BrandingConfig.parse(branding);
        });
    }
}
