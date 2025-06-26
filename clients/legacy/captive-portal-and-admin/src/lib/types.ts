export type VastAdData = {
    adId: string;
    duration: string;
    mediaFileUrl: string;
    clickThroughUrl: string;
    impressionUrls: string[];
    trackingEvents: Record<string, string[]>;
};
