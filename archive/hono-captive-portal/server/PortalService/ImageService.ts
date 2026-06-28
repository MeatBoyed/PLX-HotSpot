import type { PortalService } from './PortalService.js'

const DEFAULT_IMAGE_FIELDS = new Set(['logo', 'logoWhite', 'connectCardBackground', 'bannerOverlay', 'favicon'])
const DEFAULT_ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const DEFAULT_MAX_FILE_BYTES = 20 * 1024 * 1024

// Slug policy: lowercase snake_case, 2..64 chars, start/end alphanumeric. Only underscores as separators.
function validateSlug(slug: string): boolean {
    return /^[a-z0-9](?:[a-z0-9_]{0,62}[a-z0-9])$/.test(slug)
}

// Normalize any field name to a slug per policy:
// - Break camelCase boundaries with '_'
// - Lowercase
// - Replace non [a-z0-9_] with '_'
// - Collapse multiple '_' and trim leading/trailing '_'
function toSlug(field: string): string {
    const withUnderscores = field
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase -> snake
        .toLowerCase();
    const sanitized = withUnderscores
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    return sanitized;
}

export interface ImageProcessResult {
    updates: Record<string, string>
    errors: Array<{ field: string; reason: string }>
}

export class ImageService {
    constructor(private portalService: PortalService) { }

    /**
     * Process multipart/form-data for known image fields and persist them using PortalService.
     * Returns updates mapping field -> stored.path and a list of per-file errors (if any).
     */
    async processFormData(
        ssid: string,
        form: FormData,
        options?: {
            allowedFields?: Set<string>
            allowedMime?: Set<string>
            maxFileBytes?: number
        }
    ): Promise<ImageProcessResult> {
        const allowedFields = options?.allowedFields ?? DEFAULT_IMAGE_FIELDS
        const allowedMime = options?.allowedMime ?? DEFAULT_ALLOWED_MIME
        const maxBytes = options?.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES

        const updates: Record<string, string> = {}
        const errors: Array<{ field: string; reason: string }> = []

        for (const [field, value] of form.entries()) {
            if (field === 'json') continue
            if (!(value instanceof File)) continue
            if (!allowedFields.has(field)) continue // silently ignore unknown fields

            const file = value as File
            if (!allowedMime.has(file.type)) {
                errors.push({ field, reason: 'Unsupported mime type' }); continue
            }
            if (file.size > maxBytes) {
                errors.push({ field, reason: 'File too large' }); continue
            }
            const arrayBuffer = await file.arrayBuffer()
            const dataBuf = Buffer.from(arrayBuffer)
            // ENFORCE: use normalized field name as slug (lowercase snake_case)
            const slug = toSlug(field)
            if (!validateSlug(slug)) {
                errors.push({ field, reason: 'Invalid derived slug' }); continue
            }
            try {
                const stored = await this.portalService.upsertBrandingImage({ ssid, slug, mimeType: file.type, data: dataBuf })
                updates[field] = stored.path
            } catch (e: any) {
                errors.push({ field, reason: e?.message || 'Store failed' })
            }
        }

        return { updates, errors }
    }

    /** Fetch image binary/meta by (ssid, slug) via PortalService */
    async getImage(ssid: string, slug: string): Promise<{ data: Buffer; mimeType: string; size: number; hash: string; updatedAt?: Date }> {
        return this.portalService.getBrandingImage(ssid, slug)
    }
}
