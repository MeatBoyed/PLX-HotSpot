/**
 * API Types & Schemas
 * Generated from ASP.NET API spec
 * Provides runtime validation via Zod + TypeScript inference
 */

import { z } from 'zod';

// ============================================================================
// SHARED TYPES
// ============================================================================

export const SiteStatusSchema = z.enum(['active', 'suspended', 'maintenance']);
export type SiteStatus = z.infer<typeof SiteStatusSchema>;

export const AuthMethodSchema = z.enum(['free', 'voucher', 'pu-login', 'pu-phonename', 'sms']);
export type AuthMethod = z.infer<typeof AuthMethodSchema>;

// ============================================================================
// BRANDING
// ============================================================================

export const BrandingConfigSchema = z.object({
    // Identity
    id: z.number().int().positive(),
    ssid: z.string().min(1).max(255),
    name: z.string().min(1).max(255),

    // Colors
    brandPrimary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#301358'),
    brandPrimaryHover: z.string().regex(/^#[0-9A-F]{6}$/i).default('#5B3393'),
    brandSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#F2F2F2'),
    brandAccent: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FF6B35'),

    // Text Colors
    textPrimary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000'),
    textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#424242'),
    textTertiary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#757575'),
    textMuted: z.string().regex(/^#[0-9A-F]{6}$/i).default('#BDBDBD'),

    // Surface Colors
    surfaceCard: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    surfaceWhite: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    surfaceBorder: z.string().regex(/^#[0-9A-F]{6}$/i).default('#E0E0E0'),

    // Button Colors
    buttonPrimary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#301358'),
    buttonPrimaryHover: z.string().regex(/^#[0-9A-F]{6}$/i).default('#5B3393'),
    buttonPrimaryText: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    buttonSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).default('#F2F2F2'),
    buttonSecondaryHover: z.string().regex(/^#[0-9A-F]{6}$/i).default('#E0E0E0'),
    buttonSecondaryText: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000'),

    // Images
    logo: z.string().url().nullable().default(null),
    logoWhite: z.string().url().nullable().default(null),
    favicon: z.string().url().nullable().default(null),
    connectCardBackground: z.string().url().nullable().default(null),
    bannerOverlay: z.string().url().nullable().default(null),
    splashBackground: z.string().url().nullable().default(null),

    // Text Content
    heading: z.string().max(255).nullable().default(null),
    subheading: z.string().max(255).nullable().default(null),
    buttonText: z.string().max(255).nullable().default(null),
    splashHeading: z.string().max(255).nullable().default(null),
    termsLinks: z.string().nullable().default(null),

    // Configuration
    authMethods: z.array(AuthMethodSchema).default(['free']),
    marketingOptIn: z.boolean().default(false),

    // Ads Configuration
    adsReviveServerUrl: z.string().url().nullable().default(null),
    adsZoneId: z.string().nullable().default(null),
    adsReviveId: z.string().nullable().default(null),
    adsVastUrl: z.string().url().nullable().default(null),

    // Metadata
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),

    // Multi-site support (Phase 2)
    parentSsid: z.string().nullable().default(null),
    venueLabel: z.string().nullable().default(null),
    venueRoute: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
});

export type BrandingConfig = z.infer<typeof BrandingConfigSchema>;

// ============================================================================
// PACKAGES
// ============================================================================

export const PackageSchema = z.object({
    id: z.number().int().positive(),
    siteId: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().nullable().optional(),
    price: z.number().positive(),
    currency: z.string().length(3).default('ZAR'),
    validity: z.number().int().positive(), // in minutes
    dataLimit: z.number().int().nullable().optional(), // in MB, null = unlimited
    speedLimit: z.number().int().nullable().optional(), // in Mbps
    isActive: z.boolean().default(true),
    order: z.number().int().default(0),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type Package = z.infer<typeof PackageSchema>;

export const PackagesListSchema = z.object({
    packages: z.array(PackageSchema),
    total: z.number().int().nonnegative(),
});

export type PackagesList = z.infer<typeof PackagesListSchema>;

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const OtpRequestSchema = z.object({
    phoneNumber: z.string().regex(/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone number'),
    ssid: z.string().min(1).max(255),
});

export type OtpRequest = z.infer<typeof OtpRequestSchema>;

export const OtpResponseSchema = z.object({
    requestId: z.string(),
    expiresIn: z.number().int().positive(), // seconds
    attemptsRemaining: z.number().int().nonnegative(),
});

export type OtpResponse = z.infer<typeof OtpResponseSchema>;

export const OtpVerifySchema = z.object({
    phoneNumber: z.string().regex(/^\+?[0-9\s\-()]{10,}$/),
    code: z.string().regex(/^[0-9]{4,8}$/),
    ssid: z.string().min(1).max(255),
});

export type OtpVerify = z.infer<typeof OtpVerifySchema>;

export const SessionTokenSchema = z.object({
    token: z.string(),
    expiresIn: z.number().int().positive(), // seconds
    redirectUrl: z.string().url(),
});

export type SessionToken = z.infer<typeof SessionTokenSchema>;

export const FreeAuthSchema = z.object({
    ssid: z.string().min(1).max(255),
});

export type FreeAuth = z.infer<typeof FreeAuthSchema>;

export const VoucherAuthSchema = z.object({
    code: z.string().min(1).max(255),
    ssid: z.string().min(1).max(255),
});

export type VoucherAuth = z.infer<typeof VoucherAuthSchema>;

// ============================================================================
// MARKETING
// ============================================================================

export const MarketingOptInSchema = z.object({
    email: z.string().email(),
    ssid: z.string().min(1).max(255),
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    phoneNumber: z.string().max(20).optional(),
    preferences: z.record(z.boolean()).optional(),
});

export type MarketingOptIn = z.infer<typeof MarketingOptInSchema>;

export const MarketingOptInResponseSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    status: z.enum(['subscribed', 'pending_confirmation', 'unsubscribed']),
    createdAt: z.string().datetime(),
});

export type MarketingOptInResponse = z.infer<typeof MarketingOptInResponseSchema>;

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export const SiteIdentifierSchema = z.object({
    ssid: z.string().min(1).max(255),
});

export type SiteIdentifier = z.infer<typeof SiteIdentifierSchema>;

// ============================================================================
// ERROR RESPONSE
// ============================================================================

export const ApiErrorSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
        requestId: z.string().optional(),
    }),
});

export type ApiErrorType = z.infer<typeof ApiErrorSchema>;
