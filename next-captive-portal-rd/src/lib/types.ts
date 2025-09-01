import z from "zod";
import { schemas } from "./hotspotAPI"

export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
    adId?: string;
    trackingEvents?: Record<string, string[]>;
}

export type BrandingConfig = z.infer<typeof schemas.BrandingConfig>