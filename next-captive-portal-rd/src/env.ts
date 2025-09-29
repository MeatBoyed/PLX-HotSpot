import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Central environment schema using T3 Env
export const env = createEnv({
    server: {
        // Branding / site metadata
        SITE_TITLE: z.string().min(1).default('PluxNet Fibre HotSpot'),
        SITE_DESCRIPTION: z.string().min(1).default('PluxNet Fibre HotSpot'),
        BRAND_NAME: z.string().min(1).default('PluxNet'),

        // Mikrotik / networking
        MIKROTIK_RADIUS_DESK_BASE_URL: z.string().url().default('https://radiusdesk.pluxnet.co.za'),
        MIKROTIK_REDIRECT_URL: z.string().url().default('https://pluxnet.co.za'),

        // Feature flags
        USE_SEED_DATA: z.enum(['true', 'false']).default('false'),
    },
    client: {
        // Expose only safe public vars (prefix NEXT_PUBLIC_). Add as needed.
        NEXT_PUBLIC_HOTSPOT_API_BASE_URL: z.string().url().default('https://hotspot.pluxnet.co.za'),
        NEXT_PUBLIC_SSID: z.string().min(1),
        NEXT_PUBLIC_MIKROTIK_BASE_URL: z.string().url().default('https://gateway.pluxnet.co.za'),
        NEXT_PUBLIC_MIKROTIK_DEFAULT_USERNAME: z.string().min(1).default('click_to_connect@dev'),
        NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD: z.string().min(1).default('click_to_connect'),
        NEXT_PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:3001'),
    },
    runtimeEnv: {
        SITE_TITLE: process.env.SITE_TITLE,
        SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
        BRAND_NAME: process.env.BRAND_NAME,
        NEXT_PUBLIC_SSID: process.env.NEXT_PUBLIC_SSID,
        NEXT_PUBLIC_HOTSPOT_API_BASE_URL: process.env.NEXT_PUBLIC_HOTSPOT_API_BASE_URL,
        NEXT_PUBLIC_MIKROTIK_DEFAULT_USERNAME: process.env.NEXT_PUBLIC_MIKROTIK_DEFAULT_USERNAME,
        NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD: process.env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD,
        MIKROTIK_RADIUS_DESK_BASE_URL: process.env.MIKROTIK_RADIUS_DESK_BASE_URL,
        MIKROTIK_REDIRECT_URL: process.env.MIKROTIK_REDIRECT_URL,
        NEXT_PUBLIC_MIKROTIK_BASE_URL: process.env.NEXT_PUBLIC_MIKROTIK_BASE_URL,
        USE_SEED_DATA: process.env.USE_SEED_DATA,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
    }
});
