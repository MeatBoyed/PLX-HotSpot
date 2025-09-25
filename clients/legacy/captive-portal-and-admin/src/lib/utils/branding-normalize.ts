import { BrandingConfig } from "@/lib/types";
import { pluxnetTheme } from "@/lib/theme";

// Keep list of known keys to optionally strip unknown props (basic allowlist)
const KNOWN_KEYS = new Set<keyof BrandingConfig>([
  "id", "ssid", "name", "brandPrimary", "brandPrimaryHover", "brandSecondary", "brandAccent", "textPrimary", "textSecondary", "textTertiary", "textMuted", "surfaceCard", "surfaceWhite", "surfaceBorder", "buttonPrimary", "buttonPrimaryHover", "buttonPrimaryText", "buttonSecondary", "buttonSecondaryHover", "buttonSecondaryText", "logo", "logoWhite", "connectCardBackground", "bannerOverlay", "favicon", "adsReviveServerUrl", "adsZoneId", "adsReviveId", "adsVastUrl", "termsLinks", "heading", "subheading", "buttonText", "splashBackground", "splashHeading", "authMethods", "createdAt", "updatedAt"
]);

export function normalizeBranding(input: Partial<BrandingConfig> | null | undefined): BrandingConfig {
  const base: BrandingConfig = pluxnetTheme;
  const draft: Partial<BrandingConfig> = { ...base, ...(input || {}) };

  if (!draft.updatedAt) draft.updatedAt = new Date().toISOString();
  if (!draft.createdAt) draft.createdAt = base.createdAt;

  // Build a clean object with only allowed keys
  const cleaned: Partial<BrandingConfig> = {};
  for (const key of Object.keys(draft) as (keyof BrandingConfig)[]) {
    if (KNOWN_KEYS.has(key)) {
      cleaned[key] = draft[key];
    }
  }
  return cleaned as BrandingConfig;
}

export function brandingToCssVars(theme: BrandingConfig): Record<string, string> {
  return {
    '--brand-primary': theme.brandPrimary,
    '--brand-primary-hover': theme.brandPrimaryHover,
    '--brand-secondary': theme.brandSecondary,
    '--brand-accent': theme.brandAccent,
    '--text-primary': theme.textPrimary,
    '--text-secondary': theme.textSecondary,
    '--text-tertiary': theme.textTertiary,
    '--text-muted': theme.textMuted,
    '--surface-card': theme.surfaceCard,
    '--surface-white': theme.surfaceWhite,
    '--surface-border': theme.surfaceBorder,
    '--button-primary': theme.buttonPrimary,
    '--button-primary-hover': theme.buttonPrimaryHover,
    '--button-primary-text': theme.buttonPrimaryText,
    '--button-secondary': theme.buttonSecondary,
    '--button-secondary-hover': theme.buttonSecondaryHover,
    '--button-secondary-text': theme.buttonSecondaryText,
  };
}
