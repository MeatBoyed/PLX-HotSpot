import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Central environment schema using T3 Env
export const env = createEnv({
    server: {
        // Node environment (use only via env, not process.env directly)
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

        // Branding / site metadata
        SITE_TITLE: z.string().min(1).default('PluxNet Fibre HotSpot'),
        SITE_DESCRIPTION: z.string().min(1).default('PluxNet Fibre HotSpot'),
        BRAND_NAME: z.string().min(1).default('PluxNet'),

        // Mikrotik / networking
        MIKROTIK_RADIUS_DESK_BASE_URL: z.string().url().default('https://radiusdesk.pluxnet.co.za'),
        MIKROTIK_REDIRECT_URL: z.string().url().default('https://pluxnet.co.za'),

        // PayFast (server-side) - all optional for deployments without payment features
        PAYFAST_MODE: z.string().transform(val => val === '' ? 'sandbox' : val).pipe(z.enum(['sandbox', 'live'])).optional().default('sandbox'),
        PAYFAST_MERCHANT_ID: z.string().optional(),
        PAYFAST_MERCHANT_KEY: z.string().optional(),
        PAYFAST_PASSPHRASE: z.string().optional(),
        PAYFAST_DEBUG_SIGNING: z.string().optional(),
        PAYFAST_TEST_MSISDN: z.string().optional(),

        // Voucher / RadiusDesk integration
        VOUCHER_DEFAULT_TTL_HOURS: z.coerce.number().default(24),
        RADIUSDESK_TOKEN: z.string().optional(),
        RADIUSDESK_REALM_ID: z.string().optional(),
        RADIUSDESK_PROFILE_ID: z.string().optional(),
        RADIUSDESK_CLOUD_ID: z.string().optional(),

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
        NODE_ENV: process.env.NODE_ENV,
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
        PAYFAST_MODE: process.env.PAYFAST_MODE,
        PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID,
        PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY,
        PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE,
        PAYFAST_DEBUG_SIGNING: process.env.PAYFAST_DEBUG_SIGNING,
        PAYFAST_TEST_MSISDN: process.env.PAYFAST_TEST_MSISDN,
        VOUCHER_DEFAULT_TTL_HOURS: process.env.VOUCHER_DEFAULT_TTL_HOURS,
        RADIUSDESK_TOKEN: process.env.RADIUSDESK_TOKEN,
        RADIUSDESK_REALM_ID: process.env.RADIUSDESK_REALM_ID,
        RADIUSDESK_PROFILE_ID: process.env.RADIUSDESK_PROFILE_ID,
        RADIUSDESK_CLOUD_ID: process.env.RADIUSDESK_CLOUD_ID,
        USE_SEED_DATA: process.env.USE_SEED_DATA,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
    }
});
