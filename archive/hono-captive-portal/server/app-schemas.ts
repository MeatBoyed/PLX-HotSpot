import { z } from '@hono/zod-openapi'

// --- helpers (updated for hex color soft validation) ---
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/
// “Soft” hex color: enforce hex if provided; (required fields use it directly, optional fields wrap in .optional())
const hexColor = z
	.string()
	.regex(HEX_COLOR_REGEX, 'Invalid hex color (expected #RRGGBB or #RGB)')
	.max(7, 'Max length 7')

const varchar255 = (message?: string) => z.string().min(1, message || 'Required').max(255, 'Max length 255')
const optionalVarchar255 = z.string().max(255, 'Max length 255').optional()
const nullableVarchar255 = z.string().max(255, 'Max length 255').nullable()
const optionalNullableVarchar255 = z.string().max(255, 'Max length 255').nullable().optional()

export const GetBrandingConfigQuery = z
	.object({
		ssid: z
			.string()
			.min(1)
			.openapi({ description: 'SSID identifier for the branding config', example: 'my-venue-wifi' }),
	})
	.openapi('GetBrandingConfigQuery')

// Full row (as returned from DB / API).
// Timestamps represented as ISO strings (Date.toISOString())
// id is an auto-incrementing integer (serial)
export const brandingConfigSchema = z
	.object({
		id: z.number().int().positive().openapi({ example: 1 }),
		ssid: varchar255('SSID is required').openapi({ example: 'my-venue-wifi' }),
		name: varchar255('Name is required').openapi({ example: 'My Venue WiFi' }),

		// Colors (strict hex; DB always supplies defaults so required here)
		brandPrimary: hexColor.openapi({ example: '#301358', pattern: HEX_COLOR_REGEX.source }),
		brandPrimaryHover: hexColor.openapi({ example: '#5B3393', pattern: HEX_COLOR_REGEX.source }),
		brandSecondary: hexColor.openapi({ example: '#F2F2F2', pattern: HEX_COLOR_REGEX.source }),
		brandAccent: hexColor.openapi({ example: '#F60031', pattern: HEX_COLOR_REGEX.source }),
		textPrimary: hexColor.openapi({ example: '#181818', pattern: HEX_COLOR_REGEX.source }),
		textSecondary: hexColor.openapi({ example: '#5D5D5D', pattern: HEX_COLOR_REGEX.source }),
		textTertiary: hexColor.openapi({ example: '#7A7A7A', pattern: HEX_COLOR_REGEX.source }),
		textMuted: hexColor.openapi({ example: '#CECECE', pattern: HEX_COLOR_REGEX.source }),
		surfaceCard: hexColor.openapi({ example: '#F2F2F2', pattern: HEX_COLOR_REGEX.source }),
		surfaceWhite: hexColor.openapi({ example: '#FFFFFF', pattern: HEX_COLOR_REGEX.source }),
		surfaceBorder: hexColor.openapi({ example: '#CECECE', pattern: HEX_COLOR_REGEX.source }),

		// Buttons
		buttonPrimary: hexColor.openapi({ example: '#301358', pattern: HEX_COLOR_REGEX.source }),
		buttonPrimaryHover: hexColor.openapi({ example: '#5B3393', pattern: HEX_COLOR_REGEX.source }),
		buttonPrimaryText: hexColor.openapi({ example: '#FFFFFF', pattern: HEX_COLOR_REGEX.source }),
		buttonSecondary: hexColor.openapi({ example: '#FFFFFF', pattern: HEX_COLOR_REGEX.source }),
		buttonSecondaryHover: hexColor.openapi({ example: '#f5f5f5', pattern: HEX_COLOR_REGEX.source }),
		buttonSecondaryText: hexColor.openapi({ example: '#301358', pattern: HEX_COLOR_REGEX.source }),

		// Images / nullable
		logo: varchar255().openapi({ example: '/pluxnet-logo.svg' }),
		logoWhite: varchar255().openapi({ example: '/pluxnet-logo-white.svg' }),
		connectCardBackground: varchar255().openapi({ example: '/internet-claim-bg.png' }),
		bannerOverlay: optionalNullableVarchar255.openapi({ example: '/banner.png' }),
		favicon: optionalNullableVarchar255.openapi({ example: '/favicon.ico' }),

		// Advertising / Revive / VAST (optional / nullable)
		adsReviveServerUrl: optionalNullableVarchar255.openapi({ example: 'https://servedby.revive-adserver.net/asyncjs.php' }),
		adsZoneId: optionalNullableVarchar255.openapi({ example: '20641' }),
		adsReviveId: optionalNullableVarchar255.openapi({ example: '727bec5e09208690b050ccfc6a45d384' }),
		adsVastUrl: optionalNullableVarchar255.openapi({ example: 'https://example.com/vast.xml' }),

		// Copywriting (nullable)
		termsLinks: z.string().nullable().optional().openapi({ example: 'https://example.com/terms' }),
		heading: optionalNullableVarchar255.openapi({ example: 'Connect to WiFi' }),
		subheading: optionalNullableVarchar255.openapi({ example: 'Enjoy free internet access' }),
		buttonText: optionalNullableVarchar255.openapi({ example: 'Connect' }),

		// Splash (optional)
		splashBackground: optionalNullableVarchar255.openapi({ example: '/splash-bg.png' }),
		splashHeading: optionalNullableVarchar255.openapi({ example: 'Welcome to the hotspot' }),

		// Authentication (array of allowed methods)
		authMethods: z
			.array(z.enum(['free', 'voucher']))
			.openapi({ example: ['free', 'voucher'] }),

		createdAt: z.string().datetime().optional().openapi({ example: '2025-01-01T00:00:00.000Z' }),
		updatedAt: z.string().datetime().optional().openapi({ example: '2025-01-01T00:00:00.000Z' }),
	})
	.openapi('BrandingConfig')

// Create (INSERT) payload schema - exclude auto fields (id, timestamps)
// Only required: ssid, name; others optional with DB defaults
export const brandingConfigCreateSchema = z
	.object({
		ssid: varchar255('SSID is required').openapi({ example: 'my-venue-wifi' }),
		name: varchar255('Name is required').openapi({ example: 'My Venue WiFi' }),

		// Optional color overrides (soft: if provided must be hex)
		brandPrimary: hexColor.optional(),
		brandPrimaryHover: hexColor.optional(),
		brandSecondary: hexColor.optional(),
		brandAccent: hexColor.optional(),
		textPrimary: hexColor.optional(),
		textSecondary: hexColor.optional(),
		textTertiary: hexColor.optional(),
		textMuted: hexColor.optional(),
		surfaceCard: hexColor.optional(),
		surfaceWhite: hexColor.optional(),
		surfaceBorder: hexColor.optional(),
		buttonPrimary: hexColor.optional(),
		buttonPrimaryHover: hexColor.optional(),
		buttonPrimaryText: hexColor.optional(),
		buttonSecondary: hexColor.optional(),
		buttonSecondaryHover: hexColor.optional(),
		buttonSecondaryText: hexColor.optional(),

		// Optional assets / copy
		logo: varchar255().optional(),
		logoWhite: varchar255().optional(),
		connectCardBackground: varchar255().optional(),
		bannerOverlay: nullableVarchar255.optional(),
		favicon: nullableVarchar255.optional(),
		adsReviveServerUrl: nullableVarchar255.optional(),
		adsZoneId: nullableVarchar255.optional(),
		adsReviveId: nullableVarchar255.optional(),
		adsVastUrl: nullableVarchar255.optional(),
		termsLinks: z.string().nullable().optional(),
		heading: nullableVarchar255.optional(),
		subheading: nullableVarchar255.optional(),
		buttonText: nullableVarchar255.optional(),

		// Splash (optional)
		splashBackground: nullableVarchar255.optional(),
		splashHeading: nullableVarchar255.optional(),

		// Authentication (optional; defaults to ["free"]) 
		authMethods: z.array(z.enum(['free', 'voucher'])).optional(),
	})
	.strict()
	.openapi('BrandingConfigCreate')

// Update (PATCH) payload schema - id provided separately (e.g. path param); all fields optional
export const brandingConfigUpdateSchema = brandingConfigCreateSchema.partial()

// Id param schema (e.g. /branding/:id)
export const brandingConfigIdParamSchema = z.object({ id: z.coerce.number().int().positive() })

// Response list / single helpers
export const brandingConfigListResponseSchema = z.object({
	data: z.array(brandingConfigSchema),
	total: z.number().int().nonnegative().optional(),
})

export const brandingConfigSingleResponseSchema = z.object({ data: brandingConfigSchema })

// Inferred Types
export type BrandingConfig = z.infer<typeof brandingConfigSchema>
export type BrandingConfigCreateInput = z.infer<typeof brandingConfigCreateSchema>
export type BrandingConfigUpdateInput = z.infer<typeof brandingConfigUpdateSchema>
