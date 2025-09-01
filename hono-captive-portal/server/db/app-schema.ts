import { pgTable, varchar, text, timestamp, serial, uniqueIndex } from 'drizzle-orm/pg-core';

// branding_config table mirrors initial provided SQL specification
export const brandingConfig = pgTable('branding_config', {
    // Use simple auto-incrementing integer id (serial) as decided after reset
    id: serial('id').primaryKey(),
    ssid: varchar('ssid', { length: 255 }).notNull(), // externally visible identifier used by site admins & client
    name: varchar('name', { length: 255 }).notNull(), // display / marketing name (non-unique)

    // Colors
    brandPrimary: varchar('brand_primary', { length: 7 }).notNull().default('#301358'),
    brandPrimaryHover: varchar('brand_primary_hover', { length: 7 }).notNull().default('#5B3393'),
    brandSecondary: varchar('brand_secondary', { length: 7 }).notNull().default('#F2F2F2'),
    brandAccent: varchar('brand_accent', { length: 7 }).notNull().default('#F60031'),
    textPrimary: varchar('text_primary', { length: 7 }).notNull().default('#181818'),
    textSecondary: varchar('text_secondary', { length: 7 }).notNull().default('#5D5D5D'),
    textTertiary: varchar('text_tertiary', { length: 7 }).notNull().default('#7A7A7A'),
    textMuted: varchar('text_muted', { length: 7 }).notNull().default('#CECECE'),
    surfaceCard: varchar('surface_card', { length: 7 }).notNull().default('#F2F2F2'),
    surfaceWhite: varchar('surface_white', { length: 7 }).notNull().default('#FFFFFF'),
    surfaceBorder: varchar('surface_border', { length: 7 }).notNull().default('#CECECE'),

    // Buttons
    buttonPrimary: varchar('button_primary', { length: 7 }).notNull().default('#301358'),
    buttonPrimaryHover: varchar('button_primary_hover', { length: 7 }).notNull().default('#5B3393'),
    buttonPrimaryText: varchar('button_primary_text', { length: 7 }).notNull().default('#FFFFFF'),
    buttonSecondary: varchar('button_secondary', { length: 7 }).notNull().default('#FFFFFF'),
    buttonSecondaryHover: varchar('button_secondary_hover', { length: 7 }).notNull().default('#f5f5f5'),
    buttonSecondaryText: varchar('button_secondary_text', { length: 7 }).notNull().default('#301358'),

    // Images
    logo: varchar('logo', { length: 255 }).notNull().default('/pluxnet-logo.svg'),
    logoWhite: varchar('logo_white', { length: 255 }).notNull().default('/pluxnet-logo-white.svg'),
    connectCardBackground: varchar('connect_card_background', { length: 255 }).notNull().default('/internet-claim-bg.png'),
    bannerOverlay: varchar('banner_overlay', { length: 255 }),
    favicon: varchar('favicon', { length: 255 }),

    // Advertising / Revive / VAST (all optional & nullable, no defaults)
    adsReviveServerUrl: varchar('ads_revive_server_url', { length: 255 }),
    adsZoneId: varchar('ads_zone_id', { length: 255 }),
    adsReviveId: varchar('ads_revive_id', { length: 255 }),
    adsVastUrl: varchar('ads_vast_url', { length: 255 }),

    // Copywriting
    termsLinks: text('terms_links'),
    heading: varchar('heading', { length: 255 }),
    subheading: varchar('subheading', { length: 255 }),
    buttonText: varchar('button_text', { length: 255 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
    ssidUnique: uniqueIndex('branding_config_ssid_unique').on(table.ssid),
}));
