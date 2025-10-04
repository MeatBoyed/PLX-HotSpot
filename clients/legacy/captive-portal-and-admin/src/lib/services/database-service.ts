// Server-side database service for branding_config CRUD operations
// Focus: simple, maintainable, type-safe access with Prisma

import { env } from '@/env';
import { PrismaClient, Prisma } from '../../../generated/prisma';
import { normalizeBranding } from '@/lib/utils/branding-normalize';
import type { BrandingConfig as AppBrandingConfig } from '@/lib/types';

// Reuse a single Prisma client instance across HMR in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();
if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Public return type is the app-level BrandingConfig
export type BrandingConfig = AppBrandingConfig;

type BrandingConfigCreate = Prisma.branding_configCreateInput;
type BrandingConfigUpdate = Prisma.branding_configUpdateInput;

const brandingConfigSelect = {
	id: true,
	ssid: true,
	name: true,
	brand_primary: true,
	brand_primary_hover: true,
	brand_secondary: true,
	brand_accent: true,
	text_primary: true,
	text_secondary: true,
	text_tertiary: true,
	text_muted: true,
	surface_card: true,
	surface_white: true,
	surface_border: true,
	button_primary: true,
	button_primary_hover: true,
	button_primary_text: true,
	button_secondary: true,
	button_secondary_hover: true,
	button_secondary_text: true,
	logo: true,
	logo_white: true,
	connect_card_background: true,
	banner_overlay: true,
	favicon: true,
	terms_links: true,
	heading: true,
	subheading: true,
	button_text: true,
	created_at: true,
	updated_at: true,
	ads_revive_server_url: true,
	ads_zone_id: true,
	ads_revive_id: true,
	ads_vast_url: true,
	splash_background: true,
	splash_heading: true,
	auth_methods: true,
} satisfies Prisma.branding_configSelect;

export class DatabaseService {
	// Convert a prisma row (snake_case) to app shape (camelCase), then normalize to ensure defaults
	#toAppBrandingConfig(row: any): BrandingConfig {
		if (!row) throw new Error('Branding config row is empty');
		const mapped: Partial<AppBrandingConfig> = {
			id: row.id,
			ssid: row.ssid,
			name: row.name,
			brandPrimary: row.brand_primary,
			brandPrimaryHover: row.brand_primary_hover,
			brandSecondary: row.brand_secondary,
			brandAccent: row.brand_accent,
			textPrimary: row.text_primary,
			textSecondary: row.text_secondary,
			textTertiary: row.text_tertiary,
			textMuted: row.text_muted,
			surfaceCard: row.surface_card,
			surfaceWhite: row.surface_white,
			surfaceBorder: row.surface_border,
			buttonPrimary: row.button_primary,
			buttonPrimaryHover: row.button_primary_hover,
			buttonPrimaryText: row.button_primary_text,
			buttonSecondary: row.button_secondary,
			buttonSecondaryHover: row.button_secondary_hover,
			buttonSecondaryText: row.button_secondary_text,
			logo: row.logo,
			logoWhite: row.logo_white,
			connectCardBackground: row.connect_card_background,
			bannerOverlay: row.banner_overlay ?? null,
			favicon: row.favicon ?? null,
			termsLinks: row.terms_links ?? null,
			heading: row.heading ?? null,
			subheading: row.subheading ?? null,
			buttonText: row.button_text ?? null,
			adsReviveServerUrl: row.ads_revive_server_url ?? null,
			adsZoneId: row.ads_zone_id ?? null,
			adsReviveId: row.ads_revive_id ?? null,
			adsVastUrl: row.ads_vast_url ?? null,
			splashBackground: row.splash_background ?? null,
			splashHeading: row.splash_heading ?? null,
			authMethods: Array.isArray(row.auth_methods) ? row.auth_methods : undefined,
			createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
			updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
		};
		return normalizeBranding(mapped);
	}
	// Read by SSID (unique)
	async getBrandingConfig(ssid: string): Promise<BrandingConfig | null> {
		const row = await prisma.branding_config.findUnique({
			where: { ssid },
			select: brandingConfigSelect,
		});
		return row ? this.#toAppBrandingConfig(row) : null;
	}

	// Create a branding_config; throws on unique violation of ssid
	async createBrandingConfig(input: BrandingConfigCreate): Promise<BrandingConfig> {
		try {
			const created = await prisma.branding_config.create({
				data: input,
				select: brandingConfigSelect,
			});
			return this.#toAppBrandingConfig(created);
		} catch (err) {
			if (this.#isPrismaKnownError(err)) {
				// P2002: Unique constraint failed
				if (err.code === 'P2002' && Array.isArray(err.meta?.target) && err.meta?.target.includes('ssid')) {
					throw new Error(`Branding config already exists for ssid=${(input as any).ssid}`);
				}
			}
			throw err;
		}
	}

	// Update by SSID; returns null if not found
	async updateBrandingConfig(ssid: string, input: BrandingConfigUpdate): Promise<BrandingConfig | null> {
		try {
			const updated = await prisma.branding_config.update({
				where: { ssid },
				data: { ...input, updated_at: new Date() },
				select: brandingConfigSelect,
			});
			return this.#toAppBrandingConfig(updated);
		} catch (err) {
			if (this.#isPrismaKnownError(err)) {
				// P2025: Record not found
				if (err.code === 'P2025') return null;
			}
			throw err;
		}
	}

	// Upsert by SSID — creates if missing, otherwise updates
	async upsertBrandingConfig(ssid: string, createInput: BrandingConfigCreate, updateInput?: BrandingConfigUpdate): Promise<BrandingConfig> {
		const result = await prisma.branding_config.upsert({
			where: { ssid },
			create: createInput,
			update: { ...updateInput, updated_at: new Date() },
			select: brandingConfigSelect,
		});
		return this.#toAppBrandingConfig(result);
	}

	#isPrismaKnownError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
		return typeof err === 'object' && err !== null && 'code' in err && typeof (err as any).code === 'string';
	}
}

export const databaseService = new DatabaseService();

