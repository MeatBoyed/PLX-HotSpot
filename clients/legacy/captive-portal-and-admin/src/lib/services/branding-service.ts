import 'server-only';
import { BrandingConfig } from '@/lib/types';
import { hotspotAPI } from '@/lib/hotspotAPI';
import { normalizeBranding } from '@/lib/utils/branding-normalize';

const IN_PROCESS_TTL_MS = 3 * 60 * 1000; // 3 minutes

type CacheEntry = {
  data?: BrandingConfig;
  expires: number;
  inFlight?: Promise<BrandingConfig>;
};

const cache = new Map<string, CacheEntry>();

function log(...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
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
      const raw = await hotspotAPI.getApiportalconfig({ queries: { ssid } });
      // API schema guarantees a `res` field containing the BrandingConfig
      const apiData: BrandingConfig = raw.res;
      const normalized = normalizeBranding(apiData);
      cache.set(key, { data: normalized, expires: Date.now() + IN_PROCESS_TTL_MS });
      log('fetch success', { ssid });
      return normalized;
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
    if (process.env.NODE_ENV !== 'production') {
      cache.clear();
      log('cache cleared');
    }
  }
}

export { IN_PROCESS_TTL_MS };
