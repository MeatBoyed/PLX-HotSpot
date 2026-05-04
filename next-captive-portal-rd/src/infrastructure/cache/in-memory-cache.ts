/**
 * In-Memory Cache Utility
 * Simple TTL-based caching for server-side data
 * Used primarily for branding config (3 minute TTL)
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
    inFlight?: Promise<T>;
}

export class InMemoryCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private ttlMs: number;

    constructor(ttlMs: number = 3 * 60 * 1000) {
        // Default: 3 minutes
        this.ttlMs = ttlMs;
    }

    /**
     * Get cached value if not expired
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set cache value with TTL
     */
    set(key: string, value: T): void {
        this.cache.set(key, {
            data: value,
            expiresAt: Date.now() + this.ttlMs,
        });
    }

    /**
     * Get or compute with deduplication
     * Prevents multiple concurrent requests for same key
     */
    async getOrSet(key: string, compute: () => Promise<T>): Promise<T> {
        const entry = this.cache.get(key);

        // Return cached data if available and not expired
        if (entry && Date.now() <= entry.expiresAt) {
            return entry.data;
        }

        // Deduplication: if request already in flight, wait for it
        if (entry?.inFlight) {
            return entry.inFlight;
        }

        // Start new computation
        const inFlight = compute();

        // Store promise to deduplicate concurrent requests
        this.cache.set(key, {
            data: entry?.data as T, // Use old data as fallback
            expiresAt: entry?.expiresAt || 0,
            inFlight,
        });

        try {
            const result = await inFlight;
            // Store result with new TTL
            this.set(key, result);
            return result;
        } finally {
            // Clear in-flight promise
            const current = this.cache.get(key);
            if (current) {
                current.inFlight = undefined;
            }
        }
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Delete specific key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics (for debugging)
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

/**
 * Cache instances for different data types
 */
export const brandingCache = new InMemoryCache(3 * 60 * 1000); // 3 minutes
export const packageCache = new InMemoryCache(5 * 60 * 1000); // 5 minutes
export const authCache = new InMemoryCache(1 * 60 * 1000); // 1 minute (short-lived for auth)
