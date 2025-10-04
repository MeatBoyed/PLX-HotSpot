"use server";
// Server action for branding config
import { BrandingService } from '@/lib/services/branding-service';
import type { BrandingConfig } from '@/lib/types';

export async function fetchBrandingConfigAction(ssid: string): Promise<BrandingConfig> {
  // Always fetch fresh from server source; BrandingService handles caching and normalization
  const config = await BrandingService.get(ssid, { force: true });
  return config;
}
