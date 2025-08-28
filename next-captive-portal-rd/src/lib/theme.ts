/**
 * Brand Theme Configuration
 * 
 * This file allows you to easily customize the brand colors and theming
 * for different businesses while keeping the same layout and components.
 * 
 * Simply update the CSS variables below to change the brand colors throughout the app.
 */

// Enhanced window interface for theme storage
declare global {
  interface Window {
    __currentTheme?: BrandTheme;
  }
}

export interface BrandTheme {
  name: string;

  colors: {
    // Primary brand colors
    brandPrimary: string;
    brandPrimaryHover: string;
    brandSecondary: string;
    brandAccent: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;

    // Surface colors
    surfaceCard: string;
    surfaceWhite: string;
    surfaceBorder: string;

    // Button colors
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    buttonSecondaryText: string;
  };
  images: {
    // Logo images
    logo: string;
    logoWhite: string;

    // Connect card background
    connectCardBackground: string;

    // Other brand-specific images
    bannerOverlay?: string;
    favicon?: string;
  };
}

interface colours {
  // Primary brand colors
  brandPrimary: string;
  brandPrimaryHover: string;
  brandSecondary: string;
  brandAccent: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;

  // Surface colors
  surfaceCard: string;
  surfaceWhite: string;
  surfaceBorder: string;

  // Button colors
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
};
interface ConnectCardStyle {
  heading: string
  buttonText: string
  connectCardBackground: string;
}

interface DashboardHeadStyle {
  heading: string
  subheading: string
  bannerOverlay?: string;
}

interface AdProfile {
  zoneId: string
  reviveId: string
  videoVASTUrl: string
}

interface BrandProfile {
  name: string;
  logo: string;
  logoWhite: string;
  favicon?: string;
  termsLinks: string
}

export interface ApplicationProfile {
  brandProfile: BrandProfile
  adProfile: AdProfile
  colours: colours
  connectCardStyle: ConnectCardStyle
  dashboardHeadStyle: DashboardHeadStyle
  
}

// Default PluxNet theme
export const pluxnetTheme: BrandTheme = {
  name: "PluxNet",
  colors: {
    brandPrimary: "#301358",
    brandPrimaryHover: "#5B3393",
    brandSecondary: "#F2F2F2",
    brandAccent: "#F60031",
    textPrimary: "#181818",
    textSecondary: "#5D5D5D",
    textTertiary: "#7A7A7A",
    textMuted: "#CECECE",
    surfaceCard: "#F2F2F2",
    surfaceWhite: "#FFFFFF",
    surfaceBorder: "#CECECE",
    buttonPrimary: "#301358",
    buttonPrimaryHover: "#5B3393",
    buttonPrimaryText: "#FFFFFF",
    buttonSecondary: "#FFFFFF",
    buttonSecondaryHover: "#f5f5f5",
    buttonSecondaryText: "#301358",
  },
  images: {
    logo: "/pluxnet-logo.svg",
    logoWhite: "/pluxnet-logo-white.svg",
    connectCardBackground: "/internet-claim-bg.png",
    bannerOverlay: "/banner-overlay.png",
    favicon: "/favicon.svg",
  }
};

// Example alternative theme for a different business
export const exampleBusinessTheme: BrandTheme = {
  name: "Example Business",
  colors: {
    brandPrimary: "#2563eb",      // Blue
    brandPrimaryHover: "#1d4ed8",
    brandSecondary: "#f8fafc",    // Light blue-gray
    brandAccent: "#dc2626",       // Red accent
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    textTertiary: "#94a3b8",
    textMuted: "#cbd5e1",
    surfaceCard: "#f8fafc",
    surfaceWhite: "#ffffff",
    surfaceBorder: "#cbd5e1",
    buttonPrimary: "#2563eb",
    buttonPrimaryHover: "#1d4ed8",
    buttonPrimaryText: "#ffffff",
    buttonSecondary: "#ffffff",
    buttonSecondaryHover: "#f1f5f9",
    buttonSecondaryText: "#2563eb",
  },
  images: {
    logo: "/pluxnet-logo.svg", // Can be replaced with business-specific logo
    logoWhite: "/pluxnet-logo-white.svg", // Can be replaced with white version
    connectCardBackground: "/internet-claim-bg.png", // Can be replaced with custom background
    bannerOverlay: "/banner-overlay.png",
    favicon: "/favicon.svg",
  }
};

// Yellow brand theme
export const CityOfJbhTheme: BrandTheme = {
  name: "Jozi Free Wifi",
  colors: {
    brandPrimary: "#FFB600",       // Yellow primary
    brandPrimaryHover: "#E6A500",   // Darker yellow for hover
    brandSecondary: "#F2F2F2",      // Light gray like PluxNet
    brandAccent: "#F60031",         // Keep red accent
    textPrimary: "#181818",         // Black text like PluxNet
    textSecondary: "#5D5D5D",       // Dark gray text like PluxNet
    textTertiary: "#7A7A7A",        // Medium gray text like PluxNet
    textMuted: "#CECECE",           // Light gray text like PluxNet
    surfaceCard: "#F2F2F2",         // Light gray cards like PluxNet
    surfaceWhite: "#FFFFFF",        // White surfaces
    surfaceBorder: "#CECECE",       // Light gray borders like PluxNet
    buttonPrimary: "#FFB600",       // Yellow primary buttons
    buttonPrimaryHover: "#E6A500",  // Darker yellow hover
    buttonPrimaryText: "#FFFFFF",   // White text on yellow buttons
    buttonSecondary: "#FFFFFF",     // White secondary buttons
    buttonSecondaryHover: "#f5f5f5", // Light gray hover
    buttonSecondaryText: "#FFB600", // Yellow text on white buttons
  },
  images: {
    logo: "/coj-logo-black.svg", // Replace with yellow brand logo
    logoWhite: "/coj-logo-white.svg", // Replace with yellow brand white logo
    connectCardBackground: "/coj-internet-claim-bg.png", // Replace with yellow brand background
    bannerOverlay: "/banner-overlay.png",
    favicon: "/favicon.svg", // Replace with yellow brand favicon
  }
};

/**
 * Apply a theme by setting CSS custom properties
 * Call this function to switch themes at runtime
 */
export function applyTheme(theme: BrandTheme) {
  const root = document.documentElement;

  // Apply all color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Store current theme data for components to access
  if (typeof window !== 'undefined') {
    window.__currentTheme = theme;
  }
}

/**
 * Get the currently active theme
 */
export function getCurrentTheme(): BrandTheme {
  // Try to get from stored theme first
  if (typeof window !== 'undefined' && window.__currentTheme) {
    return window.__currentTheme;
  }

  // Fallback to reading from CSS (colors only)
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    name: "Current",
    colors: {
      brandPrimary: computedStyle.getPropertyValue('--brand-primary').trim(),
      brandPrimaryHover: computedStyle.getPropertyValue('--brand-primary-hover').trim(),
      brandSecondary: computedStyle.getPropertyValue('--brand-secondary').trim(),
      brandAccent: computedStyle.getPropertyValue('--brand-accent').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
      textTertiary: computedStyle.getPropertyValue('--text-tertiary').trim(),
      textMuted: computedStyle.getPropertyValue('--text-muted').trim(),
      surfaceCard: computedStyle.getPropertyValue('--surface-card').trim(),
      surfaceWhite: computedStyle.getPropertyValue('--surface-white').trim(),
      surfaceBorder: computedStyle.getPropertyValue('--surface-border').trim(),
      buttonPrimary: computedStyle.getPropertyValue('--button-primary').trim(),
      buttonPrimaryHover: computedStyle.getPropertyValue('--button-primary-hover').trim(),
      buttonPrimaryText: computedStyle.getPropertyValue('--button-primary-text').trim(),
      buttonSecondary: computedStyle.getPropertyValue('--button-secondary').trim(),
      buttonSecondaryHover: computedStyle.getPropertyValue('--button-secondary-hover').trim(),
      buttonSecondaryText: computedStyle.getPropertyValue('--button-secondary-text').trim(),
    },
    images: {
      logo: "/pluxnet-logo.svg",
      logoWhite: "/pluxnet-logo-white.svg",
      connectCardBackground: "/internet-claim-bg.png",
    }
  };
}
