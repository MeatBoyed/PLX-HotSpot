// Application Configuration
// Simple config file for hardcoded values with environment variable support

// Helper function to get environment variable with fallback
const getEnvVar = (key: string, fallback: string): string => {
    if (typeof window !== 'undefined') {
        // Client-side: return fallback (env vars are handled at build time)
        return fallback;
    }
    // Server-side: check environment variable
    return process.env[key] || fallback;
};

// Helper function to get boolean environment variable
const getEnvBool = (key: string, fallback: boolean): boolean => {
    if (typeof window !== 'undefined') {
        return fallback;
    }
    const envValue = process.env[key];
    if (envValue === undefined) return fallback;
    return envValue.toLowerCase() === 'true';
};

export const appConfig = {
    // Development/Test settings
    useSeedData: getEnvBool('USE_SEED_DATA', false), // Use seed data for development/testing

    // Site metadata
    site: {
        title: getEnvVar('SITE_TITLE', "COJ Fibre HotSpot"),
        description: getEnvVar('SITE_DESCRIPTION', "PluxNet Fibre HotSpot"),
        brandName: getEnvVar('BRAND_NAME', "PluxNet"),
    },

    // Navigation and links
    navigation: {
        logoClickUrl: getEnvVar('LOGO_CLICK_URL', "https://pluxnet.co.za"), // URL when logo is clicked
        homeUrl: getEnvVar('HOME_URL', "/"), // Home page URL
        viewAllNewsUrl: getEnvVar('VIEW_ALL_NEWS_URL', "#"), // View all news link
    },

    // Hotspot configuration
    hotspot: {
        providerName: getEnvVar('HOTSPOT_PROVIDER_NAME', "PluxNet Fibre"),
        freeDataAmount: getEnvVar('HOTSPOT_FREE_DATA_AMOUNT', "1.5 GB"),
        welcomeMessage: getEnvVar('HOTSPOT_WELCOME_MESSAGE', "Get 1.5 GB of internet free of cost, provided by CoJ"),
        ssid: getEnvVar('HOTSPOT_SSID', "PluxNet"),
    },

    // Mikrotik credentials and settings
    mikrotik: {
        defaultUsername: getEnvVar('MIKROTIK_DEFAULT_USERNAME', "click_to_connect@dev"),
        defaultPassword: getEnvVar('MIKROTIK_DEFAULT_PASSWORD', "click_to_connect"),
        radiusDeskBaseUrl: getEnvVar('MIKROTIK_RADIUS_DESK_BASE_URL', "https://radiusdesk.pluxnet.co.za"),
        redirectUrl: getEnvVar('MIKROTIK_REDIRECT_URL', "https://pluxnet.co.za"),
        baseUrl: getEnvVar('MIKROTIK_BASE_URL', "https://gateway.pluxnet.co.za"),
    },

    // Revive Ad configuration
    ads: {
        reviveServerUrl: getEnvVar('ADS_REVIVE_SERVER_URL', "//servedby.revive-adserver.net/asyncjs.php"),
        zoneId: getEnvVar('ADS_ZONE_ID', "20641"),
        reviveId: getEnvVar('ADS_REVIVE_ID', "727bec5e09208690b050ccfc6a45d384"),
    },

    // UI Messages
    messages: {
        loadingConnect: getEnvVar('MESSAGE_LOADING_CONNECT', "Connecting to PluxNet Fibre Hotspot..."),
        successConnect: getEnvVar('MESSAGE_SUCCESS_CONNECT', "Successfully connected to PluxNet Fibre Hotspot!"),
        errorConnect: getEnvVar('MESSAGE_ERROR_CONNECT', "Failed to connect. Please try again."),
        currentPlanTitle: getEnvVar('MESSAGE_CURRENT_PLAN_TITLE', "Hotspot usage"),
        outOfInternet: getEnvVar('MESSAGE_OUT_OF_INTERNET', "You're out of internet!"),
        voucherPlaceholder: getEnvVar('MESSAGE_VOUCHER_PLACEHOLDER', "Enter voucher code"),
    },

    // Theme selection
    theme: {
        selectedTheme: getEnvVar('SELECTED_THEME', 'pluxnet'), // 'pluxnet', 'example', or 'cityofjbh'
    },
} as const;

// Type for the config (useful for TypeScript)
export type AppConfig = typeof appConfig;

// Theme selection utility
export async function getSelectedThemeFromConfig() {
    // Use dynamic import to avoid circular dependency issues
    const { pluxnetTheme, exampleBusinessTheme, CityOfJbhTheme } = await import('./theme');

    switch (appConfig.theme.selectedTheme.toLowerCase()) {
        case 'example':
            return exampleBusinessTheme;
        case "city-of-jbh":
            return CityOfJbhTheme;
        case 'cityofjbh':
            return CityOfJbhTheme;
        case 'coj':
            return CityOfJbhTheme;
        case 'pluxnet':
        default:
            return pluxnetTheme;
    }
}
