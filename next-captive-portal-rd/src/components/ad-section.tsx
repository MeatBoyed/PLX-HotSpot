"use client";
import { useTheme } from '@/components/theme-provider';
import AdBanner from '@/components/revive/ad-banner';

export default function AdSection() {
    const { theme } = useTheme();

    // Simple image banner — takes priority if configured
    if (theme?.adBannerImageUrl) {
        const banner = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={theme.adBannerImageUrl}
                alt="Advertisement"
                className="w-full h-auto rounded-lg object-cover"
            />
        );

        return (
            <section className="w-full flex items-center justify-center">
                <div className="w-full max-w-md">
                    {theme.adBannerLinkUrl ? (
                        <a href={theme.adBannerLinkUrl} target="_blank" rel="noopener noreferrer">
                            {banner}
                        </a>
                    ) : banner}
                </div>
            </section>
        );
    }

    // Fallback: Revive Adserver
    if (!theme?.adsReviveServerUrl) return null;

    return (
        <section className="w-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="w-full relative">
                    <AdBanner />
                </div>
            </div>
        </section>
    );
}
