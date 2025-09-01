import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Central environment schema using T3 Env
export const env = createEnv({
    server: {
        // Branding / site metadata
        SITE_TITLE: z.string().min(1).default('PluxNet Fibre HotSpot'),
        SITE_DESCRIPTION: z.string().min(1).default('PluxNet Fibre HotSpot'),
        BRAND_NAME: z.string().min(1).default('PluxNet'),

        SSID: z.string().min(1).default('PluxNet'),

        // Hotspot config
        HOTSPOT_PROVIDER_NAME: z.string().min(1).default('PluxNet Fibre'),
        HOTSPOT_FREE_DATA_AMOUNT: z.string().min(1).default('1.5 GB'),
        HOTSPOT_WELCOME_MESSAGE: z.string().min(1).default('Get 1.5 GB of internet free of cost, provided by PluxNet Fibre.'),
        HOTSPOT_SSID: z.string().min(1).default('PluxNet'),

        // Ads / Revive
        ADS_REVIVE_SERVER_URL: z.string().default('https://servedby.revive-adserver.net/asyncjs.php'),
        ADS_ZONE_ID: z.string().min(1).default('20641'),
        ADS_REVIVE_ID: z.string().min(1).default('727bec5e09208690b050ccfc6a45d384'),

        // Mikrotik / networking
        MIKROTIK_DEFAULT_USERNAME: z.string().min(1).default('click_to_connect@dev'),
        MIKROTIK_DEFAULT_PASSWORD: z.string().min(1).default('click_to_connect'),
        MIKROTIK_RADIUS_DESK_BASE_URL: z.string().url().default('https://radiusdesk.pluxnet.co.za'),
        MIKROTIK_REDIRECT_URL: z.string().url().default('https://pluxnet.co.za'),
        MIKROTIK_BASE_URL: z.string().url().default('https://gateway.pluxnet.co.za'),

        // Feature flags
        USE_SEED_DATA: z.enum(['true', 'false']).default('false'),
        SELECTED_THEME: z.string().default('pluxnet'),
    },
    client: {
        // Expose only safe public vars (prefix NEXT_PUBLIC_). Add as needed.
    },
    runtimeEnv: {
        SITE_TITLE: process.env.SITE_TITLE,
        SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
        BRAND_NAME: process.env.BRAND_NAME,
        SSID: process.env.SSID,
        HOTSPOT_PROVIDER_NAME: process.env.HOTSPOT_PROVIDER_NAME,
        HOTSPOT_FREE_DATA_AMOUNT: process.env.HOTSPOT_FREE_DATA_AMOUNT,
        HOTSPOT_WELCOME_MESSAGE: process.env.HOTSPOT_WELCOME_MESSAGE,
        HOTSPOT_SSID: process.env.HOTSPOT_SSID,
        ADS_REVIVE_SERVER_URL: process.env.ADS_REVIVE_SERVER_URL,
        ADS_ZONE_ID: process.env.ADS_ZONE_ID,
        ADS_REVIVE_ID: process.env.ADS_REVIVE_ID,
        MIKROTIK_DEFAULT_USERNAME: process.env.MIKROTIK_DEFAULT_USERNAME,
        MIKROTIK_DEFAULT_PASSWORD: process.env.MIKROTIK_DEFAULT_PASSWORD,
        MIKROTIK_RADIUS_DESK_BASE_URL: process.env.MIKROTIK_RADIUS_DESK_BASE_URL,
        MIKROTIK_REDIRECT_URL: process.env.MIKROTIK_REDIRECT_URL,
        MIKROTIK_BASE_URL: process.env.MIKROTIK_BASE_URL,
        USE_SEED_DATA: process.env.USE_SEED_DATA,
        SELECTED_THEME: process.env.SELECTED_THEME,
    }
});
