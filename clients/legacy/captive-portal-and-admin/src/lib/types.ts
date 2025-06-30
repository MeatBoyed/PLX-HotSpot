export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
    adId?: string;
    trackingEvents?: Record<string, string[]>;
}
