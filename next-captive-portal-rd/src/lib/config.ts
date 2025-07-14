// Application Configuration
// Simple config file for hardcoded values

export const appConfig = {
    // Development/Test settings
    useSeedData: false, // Use seed data for development/testing

    // Site metadata
    site: {
        title: "COJ Fibre HotSpot",
        description: "PluxNet Fibre HotSpot",
        brandName: "PluxNet",
    },

    // Navigation and links
    navigation: {
        logoClickUrl: "https://pluxnet.co.za", // URL when logo is clicked
        homeUrl: "/", // Home page URL
        viewAllNewsUrl: "#", // View all news link
    },

    // Hotspot configuration
    hotspot: {
        providerName: "PluxNet Fibre",
        freeDataAmount: "1.5 GB",
        welcomeMessage: "Get 1.5 GB of internet free of cost, provided by CoJ",
        ssid: "PluxNet",
    },

    // Mikrotik credentials and settings
    mikrotik: {
        defaultUsername: "click_to_connect@dev",
        defaultPassword: "click_to_connect",
        radiusDeskBaseUrl: "https://radiusdesk.pluxnet.co.za",
        redirectUrl: "https://pluxnet.co.za",
    },

    // Revive Ad configuration
    ads: {
        reviveServerUrl: "//servedby.revive-adserver.net/asyncjs.php",
        zoneId: "20641",
        reviveId: "727bec5e09208690b050ccfc6a45d384",
    },

    // UI Messages
    messages: {
        loadingConnect: "Connecting to PluxNet Fibre Hotspot...",
        successConnect: "Successfully connected to PluxNet Fibre Hotspot!",
        errorConnect: "Failed to connect. Please try again.",
        currentPlanTitle: "Hotspot usage",
        outOfInternet: "You're out of internet!",
        voucherPlaceholder: "Enter voucher code",
    },
} as const;

// Type for the config (useful for TypeScript)
export type AppConfig = typeof appConfig;
