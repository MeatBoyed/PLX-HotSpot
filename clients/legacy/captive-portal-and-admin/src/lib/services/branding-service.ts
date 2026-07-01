import { BrandingConfig } from '@/lib/types';
import { databaseService } from '@/lib/services/database-service';
import { env } from '@/env';

const IN_PROCESS_TTL_MS = 3 * 60 * 1000; // 3 minutes

type CacheEntry = {
  data?: BrandingConfig;
  expires: number;
  inFlight?: Promise<BrandingConfig>;
};

const cache = new Map<string, CacheEntry>();

function log(...args: unknown[]) {
  if (env.NODE_ENV !== 'production') {
    console.debug('[BrandingService]', ...args);
  }
}

export class BrandingService {
  static async get(ssid: string, opts?: { force?: boolean; bypassCache?: boolean }): Promise<BrandingConfig> {
    const now = Date.now();
    const key = ssid;
    const entry = cache.get(key);

    if (!opts?.force && !opts?.bypassCache && entry && entry.data && entry.expires > now) {
      log('cache hit', { ssid });
      return entry.data;
    }

    if (entry?.inFlight) {
      log('dedupe in-flight request', { ssid });
      return entry.inFlight;
    }

    const inFlight = (async () => {
      log('fetch start', { ssid });
      const dbData = await databaseService.getBrandingConfig(ssid);
      if (!dbData) {
        throw new Error(`Branding config not found for ssid=${ssid}`);
      }
      // databaseService already returns app-level normalized BrandingConfig
      cache.set(key, { data: dbData, expires: Date.now() + IN_PROCESS_TTL_MS });
      log('fetch success', { ssid });
      return dbData;
    })();

    cache.set(key, { ...(entry || { expires: 0 }), inFlight, expires: now + IN_PROCESS_TTL_MS });
    try {
      return await inFlight;
    } finally {
      const latest = cache.get(key);
      if (latest) latest.inFlight = undefined;
    }
  }

  static _clearCache() {
    if (env.NODE_ENV !== 'production') {
      cache.clear();
      log('cache cleared');
    }
  }
}

export { IN_PROCESS_TTL_MS };
