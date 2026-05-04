/**
 * Packages Service
 * Business logic for packages/pricing plans
 */

import { PackagesList } from '@/types/api.types';
import { PackagesRepository } from '../repositories/packages.repo';
import { apiClient } from '@/infrastructure/http';
import { packageCache } from '@/infrastructure/cache';

/**
 * Service - Stateless, orchestrates repository
 */
export class PackagesService {
    private repository: PackagesRepository;

    constructor() {
        this.repository = new PackagesRepository(apiClient, packageCache);
    }

    /**
     * List packages for a site
     * Server-side only
     *
     * @param ssid - Site identifier
     * @returns PackagesList with all available packages
     *
     * @example
     * // In server component
     * const { packages } = await packagesService.list('joburg-theatre');
     * return <PackageGrid packages={packages} />
     */
    async list(ssid: string): Promise<PackagesList> {
        if (!ssid) {
            throw new Error('SSID is required');
        }

        const result = await this.repository.list(ssid);

        // Business logic can go here
        // e.g., filtering, sorting, pricing adjustments, etc.

        return result;
    }
}

/**
 * Singleton instance
 */
export const packagesService = new PackagesService();
