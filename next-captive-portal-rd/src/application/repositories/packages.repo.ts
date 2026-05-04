/**
 * Packages Repository
 * Data access layer for packages/pricing plans
 */

import { Package, PackagesList } from '@/types/api.types';
import type { ApiClient } from '@/infrastructure/http';

/**
 * IPackagesRepository - Port/Interface
 */
export interface IPackagesRepository {
    /**
     * List all available packages for a site
     */
    list(ssid: string): Promise<PackagesList>;
}

/**
 * PackagesRepository - Implementation
 */
export class PackagesRepository implements IPackagesRepository {
    constructor(
        private apiClient: ApiClient,
        private cache: any
    ) { }

    async list(ssid: string): Promise<PackagesList> {
        const cacheKey = `packages:${ssid}`;

        // Try cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Use deduplication
        return this.cache.getOrSet(cacheKey, async () => {
            return this.apiClient.get<PackagesList>('/packages', { ssid });
        });
    }
}
