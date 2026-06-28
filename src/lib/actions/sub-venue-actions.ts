"use server";
import { databaseService } from '@/lib/services/database-service';
import type { BrandingConfig } from '@/lib/types';

export async function getSubVenuesAction(parentSsid: string): Promise<BrandingConfig[]> {
    return await databaseService.getSubVenues(parentSsid);
}
