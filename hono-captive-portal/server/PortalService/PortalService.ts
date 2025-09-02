import type { BrandingConfigCreateInput, BrandingConfig } from '../app-schemas.js'
import { createAppDb } from '../db/index.js'
import { brandingConfig, brandingImage } from '../db/app-schema.js'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'

// Portal related domain logic (branding, sessions, etc.)
export class PortalService {
    // Using NodePgDatabase (schema typing can be tightened later once full schema map is declared)
    private db: NodePgDatabase

    constructor(dbUrl: string) {
        this.db = createAppDb(dbUrl) as NodePgDatabase
    }

    /**
     * Create a branding_config row. Only sends provided fields so DB defaults apply.
     * Returns the new row id.
     */
    async createBrandingConfig(payload: BrandingConfigCreateInput): Promise<number> {
        // Filter out undefined values so defaults (in DB) are used
        const values: Record<string, any> = {}
        for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined) values[k] = v
        }

        const inserted = await this.db
            .insert(brandingConfig)
            .values(values as any)
            .returning({ id: brandingConfig.id })
        if (!inserted[0] || typeof inserted[0].id !== 'number') throw new Error('Insert failed for branding_config')
        return inserted[0].id
    }

    /**
     * Get specified branding Config
     */
    async getBrandingConfig(ssid: string, name?: string): Promise<BrandingConfig> {
        if (!ssid || ssid.length === 0) throw new Error('Invalid ssid')
        const rows = await this.db
            .select()
            .from(brandingConfig)
            .where(eq(brandingConfig.ssid, ssid))
            .limit(1)
        if (!rows[0]) throw new Error('Branding config not found')
        const row = rows[0] as any
        // Normalize timestamp fields to ISO strings for schema contract
        const normalized: BrandingConfig = {
            ...row,
            createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
        }
        return normalized
    }

    /**
     * Partially update a branding_config row identified by ssid.
     * Only defined fields in the updates object are sent so DB defaults / triggers remain intact.
     * Returns the full updated BrandingConfig (normalized timestamps).
     */
    async updateBrandingConfig(ssid: string, updates: Partial<BrandingConfigCreateInput>): Promise<BrandingConfig> {
        if (!ssid || ssid.length === 0) throw new Error('Invalid ssid')
        if (!updates || Object.keys(updates).length === 0) {
            // No updates requested: just return current record
            return this.getBrandingConfig(ssid)
        }

        // Filter out undefined so we do not overwrite with NULL unintentionally
        const values: Record<string, any> = {}
        for (const [k, v] of Object.entries(updates)) {
            if (v !== undefined) values[k] = v
        }
        if (Object.keys(values).length === 0) {
            return this.getBrandingConfig(ssid)
        }

        const rows = await this.db
            .update(brandingConfig)
            .set(values as any)
            .where(eq(brandingConfig.ssid, ssid))
            .returning()

        if (!rows[0]) throw new Error('Branding config not found or update failed')
        const row = rows[0] as any
        const normalized: BrandingConfig = {
            ...row,
            createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
        }
        return normalized
    }

    /** Upsert (overwrite) a branding image by (ssid, slug). Returns stored metadata. */
    async upsertBrandingImage(params: { ssid: string; slug: string; mimeType: string; data: Buffer }): Promise<{ slug: string; path: string; hash: string; size: number; mimeType: string; }> {
        const { ssid, slug, mimeType, data } = params
        if (!ssid) throw new Error('Missing ssid')
        if (!slug) throw new Error('Missing slug')
        if (!data || data.length === 0) throw new Error('Empty image data')
        const size = data.length
        const hash = crypto.createHash('sha256').update(data).digest('hex')
        // Try update first (ON CONFLICT like behavior manually as drizzle lacks native upsert for PG < some version)
        const existing = await this.db.select().from(brandingImage).where(and(eq(brandingImage.ssid, ssid), eq(brandingImage.slug, slug))).limit(1)
        const base64 = data.toString('base64')
        if (existing[0]) {
            await this.db.update(brandingImage).set({ data: base64, mimeType, sizeBytes: size, sha256Hash: hash }).where(and(eq(brandingImage.ssid, ssid), eq(brandingImage.slug, slug)))
        } else {
            await this.db.insert(brandingImage).values({ ssid, slug, data: base64, mimeType, sizeBytes: size, sha256Hash: hash })
        }
        return { slug, path: `/${ssid}/${slug}`, hash, size, mimeType }
    }

    /** Fetch image binary by (ssid, slug) */
    async getBrandingImage(ssid: string, slug: string): Promise<{ data: Buffer; mimeType: string; size: number; hash: string; updatedAt?: Date }> {
        if (!ssid) throw new Error('Missing ssid')
        if (!slug) throw new Error('Missing slug')
        const rows = await this.db.select().from(brandingImage).where(and(eq(brandingImage.ssid, ssid), eq(brandingImage.slug, slug))).limit(1)
        if (!rows[0]) throw new Error('Not found')
        const row: any = rows[0]
        const buf = Buffer.from(row.data, 'base64')
        return { data: buf, mimeType: row.mimeType, size: row.sizeBytes, hash: row.sha256Hash, updatedAt: row.updatedAt }
    }
}
