"use server";
import { portalSubVenuesApi } from '@/infrastructure/api';
import type { BrandingConfig } from '@/lib/types';

export async function getSubVenuesAction(parentSsid: string): Promise<BrandingConfig[]> {
    return portalSubVenuesApi.list(parentSsid);
}
