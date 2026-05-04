"use server";
// Server action for branding config
import { brandingService } from '@/application/services';
import type { BrandingConfig } from '@/lib/types';

export async function fetchBrandingConfigAction(ssid: string): Promise<BrandingConfig> {
  // Always fetch fresh from server source; brandingService handles caching and normalization
  const config = await brandingService.get(ssid, { bypassCache: true });
  return config;
}
