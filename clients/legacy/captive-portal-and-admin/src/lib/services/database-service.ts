// Server-side database service for branding_config CRUD operations
// Focus: simple, maintainable, type-safe access with Prisma

import { env } from '@/env';
import { PrismaClient, Prisma } from '../../../generated/prisma';
import { normalizeBranding } from '@/lib/utils/branding-normalize';
import type { BrandingConfig as AppBrandingConfig } from '@/lib/types';

// Update payload shape (app-level/camelCase). Allows nulls for nullable fields.
export type BrandingConfigAppUpdate = {
	name?: string;
	// colors
	brandPrimary?: string;
	brandPrimaryHover?: string;
	brandSecondary?: string;
	brandAccent?: string;
	textPrimary?: string;
	textSecondary?: string;
	textTertiary?: string;
	textMuted?: string;
	surfaceCard?: string;
	surfaceWhite?: string;
	surfaceBorder?: string;
	// buttons
	buttonPrimary?: string;
	buttonPrimaryHover?: string;
	buttonPrimaryText?: string;
	buttonSecondary?: string;
	buttonSecondaryHover?: string;
	buttonSecondaryText?: string;
	// assets & text
	logo?: string | null;
	logoWhite?: string | null;
	connectCardBackground?: string | null;
	bannerOverlay?: string | null;
	favicon?: string | null;
	termsLinks?: string | null;
	heading?: string | null;
	subheading?: string | null;
	buttonText?: string | null;
	// ads
	adsReviveServerUrl?: string | null;
	adsZoneId?: string | null;
	adsReviveId?: string | null;
	adsVastUrl?: string | null;
	// splash
	splashBackground?: string | null;
	splashHeading?: string | null;
	// auth
	authMethods?: string[];
};

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
	#toAppBrandingConfig(row: Prisma.branding_configGetPayload<{ select: typeof brandingConfigSelect }>): BrandingConfig {
		if (!row) throw new Error('Branding config row is empty');
		const rawAuth = Array.isArray(row.auth_methods) ? row.auth_methods : undefined;
		const filteredAuth = rawAuth?.filter((m: unknown): m is 'free' | 'voucher' | "pu-login" => m === 'free' || m === 'voucher' || m === "pu-login");
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
			authMethods: filteredAuth,
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
					throw new Error(`Branding config already exists for ssid=${(input as { ssid?: string }).ssid}`);
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

	// Convenience: accept app-level camelCase fields and map to Prisma update
	async updateBrandingConfigApp(ssid: string, updates: BrandingConfigAppUpdate): Promise<BrandingConfig | null> {
		const map: Record<string, string> = {
			name: 'name',
			brandPrimary: 'brand_primary',
			brandPrimaryHover: 'brand_primary_hover',
			brandSecondary: 'brand_secondary',
			brandAccent: 'brand_accent',
			textPrimary: 'text_primary',
			textSecondary: 'text_secondary',
			textTertiary: 'text_tertiary',
			textMuted: 'text_muted',
			surfaceCard: 'surface_card',
			surfaceWhite: 'surface_white',
			surfaceBorder: 'surface_border',
			buttonPrimary: 'button_primary',
			buttonPrimaryHover: 'button_primary_hover',
			buttonPrimaryText: 'button_primary_text',
			buttonSecondary: 'button_secondary',
			buttonSecondaryHover: 'button_secondary_hover',
			buttonSecondaryText: 'button_secondary_text',
			logo: 'logo',
			logoWhite: 'logo_white',
			connectCardBackground: 'connect_card_background',
			bannerOverlay: 'banner_overlay',
			favicon: 'favicon',
			termsLinks: 'terms_links',
			heading: 'heading',
			subheading: 'subheading',
			buttonText: 'button_text',
			adsReviveServerUrl: 'ads_revive_server_url',
			adsZoneId: 'ads_zone_id',
			adsReviveId: 'ads_revive_id',
			adsVastUrl: 'ads_vast_url',
			splashBackground: 'splash_background',
			splashHeading: 'splash_heading',
			authMethods: 'auth_methods',
		};
		const prismaUpdate: Record<string, unknown> = {};
		for (const [ckey, value] of Object.entries(updates)) {
			if (!(ckey in map)) continue;
			const dbKey = map[ckey as keyof typeof map];
			if (value === undefined) continue; // omit undefined
			prismaUpdate[dbKey] = value; // null allowed to clear, arrays passed as-is
		}
		if (Object.keys(prismaUpdate).length === 0) return await this.getBrandingConfig(ssid);
		return await this.updateBrandingConfig(ssid, prismaUpdate as Prisma.branding_configUpdateInput);
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
		return typeof err === 'object' && err !== null && 'code' in (err as Record<string, unknown>) && typeof (err as { code?: unknown }).code === 'string';
	}
}

export const databaseService = new DatabaseService();

