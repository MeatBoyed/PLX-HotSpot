/**
 * Branding Service
 * Business logic for branding operations
 */

import { BrandingConfig } from '@/lib/types';
import { BrandingRepository } from '../repositories/branding.repo';
import { apiClient } from '@/infrastructure/http';
import { brandingCache } from '@/infrastructure/cache';

/**
 * Service - Stateless, orchestrates repository
 * Handles all branding-related business logic
 */
export class BrandingService {
    private repository: BrandingRepository;

    constructor() {
        // Inject dependencies
        this.repository = new BrandingRepository(apiClient, brandingCache);
    }

    /**
     * Get branding config for a site
     * Server-side only - call from server components/actions
     *
     * @param ssid - Site identifier
     * @param options - Optional flags
     * @returns BrandingConfig - Fully normalized branding data
     *
     * @example
     * // In server component
     * const branding = await brandingService.get('joburg-theatre');
     * return <ThemeProvider theme={branding}>{children}</ThemeProvider>
     */
    async get(ssid: string, options?: { bypassCache?: boolean }): Promise<BrandingConfig> {
        if (!ssid) {
            throw new Error('SSID is required');
        }

        const branding = await this.repository.get(ssid, options);

        // Additional business logic can go here
        // e.g., validation, transformation, audit logging, etc.

        return branding;
    }

    /**
     * Clear cache (development only)
     */
    clearCache(ssid?: string): void {
        if (process.env.NODE_ENV === 'production') {
            console.warn('clearCache is disabled in production');
            return;
        }

        if (ssid) {
            brandingCache.delete(`branding:${ssid}`);
        } else {
            brandingCache.clear();
        }
    }
}

/**
 * Singleton instance
 */
export const brandingService = new BrandingService();
