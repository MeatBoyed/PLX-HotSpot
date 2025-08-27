import { z } from '@hono/zod-openapi'

// Shared validators
const hexColor = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/i, 'Must be a valid 6-digit hex color (e.g. #1A2B3C)')

const varchar255 = (message?: string) => z.string().min(1, message || 'Required').max(255, 'Max length 255')
const optionalVarchar255 = z.string().max(255, 'Max length 255').optional()

export const GetBrandingConfigQuery = z
	.object({
		ssid: z
			.string()
			.min(1)
			.openapi({ description: 'SSID identifier for the branding config', example: 'my-venue-wifi' }),
		name: z.string().optional().openapi({ nullable: true, description: 'Optional future filter, currently unused' }),
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

		// Colors
		brandPrimary: hexColor.openapi({ example: '#301358' }),
		brandPrimaryHover: hexColor.openapi({ example: '#5B3393' }),
		brandSecondary: hexColor.openapi({ example: '#F2F2F2' }),
		brandAccent: hexColor.openapi({ example: '#F60031' }),
		textPrimary: hexColor.openapi({ example: '#181818' }),
		textSecondary: hexColor.openapi({ example: '#5D5D5D' }),
		textTertiary: hexColor.openapi({ example: '#7A7A7A' }),
		textMuted: hexColor.openapi({ example: '#CECECE' }),
		surfaceCard: hexColor.openapi({ example: '#F2F2F2' }),
		surfaceWhite: hexColor.openapi({ example: '#FFFFFF' }),
		surfaceBorder: hexColor.openapi({ example: '#CECECE' }),

		// Buttons
		buttonPrimary: hexColor.openapi({ example: '#301358' }),
		buttonPrimaryHover: hexColor.openapi({ example: '#5B3393' }),
		buttonPrimaryText: hexColor.openapi({ example: '#FFFFFF' }),
		buttonSecondary: hexColor.openapi({ example: '#FFFFFF' }),
		buttonSecondaryHover: hexColor.openapi({ example: '#f5f5f5' }),
		buttonSecondaryText: hexColor.openapi({ example: '#301358' }),

		// Images (stored as path strings)
		logo: varchar255().openapi({ example: '/pluxnet-logo.svg' }),
		logoWhite: varchar255().openapi({ example: '/pluxnet-logo-white.svg' }),
		connectCardBackground: varchar255().openapi({ example: '/internet-claim-bg.png' }),
		bannerOverlay: optionalVarchar255.openapi({ nullable: true, example: '/banner.png' }),
		favicon: optionalVarchar255.openapi({ nullable: true, example: '/favicon.ico' }),

		// Copywriting
		termsLinks: z.string().optional().openapi({ nullable: true, example: 'https://example.com/terms' }),
		heading: optionalVarchar255.openapi({ nullable: true, example: 'Connect to WiFi' }),
		subheading: optionalVarchar255.openapi({ nullable: true, example: 'Enjoy free internet access' }),
		buttonText: optionalVarchar255.openapi({ nullable: true, example: 'Connect' }),

		createdAt: z.string().datetime().optional().openapi({ nullable: true }),
		updatedAt: z.string().datetime().optional().openapi({ nullable: true }),
	})
	.openapi('BrandingConfig')

// Create (INSERT) payload schema - exclude auto fields (id, timestamps)
// Only required: ssid, name; others optional with DB defaults
export const brandingConfigCreateSchema = z
	.object({
		ssid: varchar255('SSID is required').openapi({ example: 'my-venue-wifi' }),
		name: varchar255('Name is required').openapi({ example: 'My Venue WiFi' }),
		// Optional overrideable defaults
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
		logo: varchar255().optional(),
		logoWhite: varchar255().optional(),
		connectCardBackground: varchar255().optional(),
		bannerOverlay: optionalVarchar255,
		favicon: optionalVarchar255,
		termsLinks: z.string().optional(),
		heading: optionalVarchar255,
		subheading: optionalVarchar255,
		buttonText: optionalVarchar255,
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
