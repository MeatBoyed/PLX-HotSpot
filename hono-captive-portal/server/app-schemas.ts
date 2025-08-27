import { z } from 'zod'

// Shared validators
const hexColor = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/i, 'Must be a valid 6-digit hex color (e.g. #1A2B3C)')

const varchar255 = (message?: string) => z.string().min(1, message || 'Required').max(255, 'Max length 255')
const optionalVarchar255 = z.string().max(255, 'Max length 255').optional()

export const GetBrandingConfigQuery = z.object({
	ssid: z.string().min(1),
	name: z.number().optional(),
})

// Full row (as returned from DB / API).
// Timestamps represented as ISO strings (Date.toISOString())
// id is an auto-incrementing integer (serial)
export const brandingConfigSchema = z.object({
	id: z.number().int().positive(),
	ssid: varchar255('SSID is required'),
	name: varchar255('Name is required'),

	// Colors
	brandPrimary: hexColor,
	brandPrimaryHover: hexColor,
	brandSecondary: hexColor,
	brandAccent: hexColor,
	textPrimary: hexColor,
	textSecondary: hexColor,
	textTertiary: hexColor,
	textMuted: hexColor,
	surfaceCard: hexColor,
	surfaceWhite: hexColor,
	surfaceBorder: hexColor,

	// Buttons
	buttonPrimary: hexColor,
	buttonPrimaryHover: hexColor,
	buttonPrimaryText: hexColor,
	buttonSecondary: hexColor,
	buttonSecondaryHover: hexColor,
	buttonSecondaryText: hexColor,

	// Images (stored as path strings)
	logo: varchar255(),
	logoWhite: varchar255(),
	connectCardBackground: varchar255(),
	bannerOverlay: optionalVarchar255,
	favicon: optionalVarchar255,

	// Copywriting
	termsLinks: z.string().optional(), // Text field (can contain serialized JSON / links)
	heading: optionalVarchar255,
	subheading: optionalVarchar255,
	buttonText: optionalVarchar255,

	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
})

// Create (INSERT) payload schema - exclude auto fields (id, timestamps)
// Only required: ssid, name; others optional with DB defaults
export const brandingConfigCreateSchema = z
	.object({

		ssid: varchar255('SSID is required'),
		name: varchar255('Name is required'),

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
