import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { logApp } from '../logger.js';
import { setCookie } from 'hono/cookie';
import { brandingConfigCreateSchema, GetBrandingConfigQuery, brandingConfigSchema } from '../app-schemas.js';
import { PortalService } from './PortalService.js';
import { Hono } from 'hono';
import { buffer } from 'node:stream/consumers';
const IMAGE_FIELDS = new Set(['logo', 'logoWhite', 'connectCardBackground', 'bannerOverlay', 'favicon']);
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;
function validateSlug(slug) {
    return /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug);
}
import { env } from 'hono/adapter';
export const portalRoute = new OpenAPIHono();
// /api/hook/login
portalRoute.post('/hook/login', async (c) => {
    const rawRequest = c.req.raw;
    const formData = await c.req.formData();
    const mikrotikData = Object.fromEntries(formData.entries());
    const data = { rawRequest, formData, mikrotikData };
    logApp({ event: 'MT Login Hook Accessed', data });
    setCookie(c, 'mikrotik-data', JSON.stringify(mikrotikData), {
        path: '/',
        maxAge: 60 * 50,
    });
    return c.redirect('/');
});
// OpenAPI route definitions
const createBrandingRoute = createRoute({
    method: 'post',
    path: '/config',
    tags: ['Branding'],
    request: {
        body: {
            content: {
                'application/json': { schema: brandingConfigCreateSchema }
            },
            required: true
        }
    },
    responses: {
        200: {
            description: 'Branding config created',
            content: {
                'application/json': {
                    schema: z.object({ id: z.number().int().positive().openapi({ example: 1 }) }).openapi('BrandingConfigCreateResponse')
                }
            }
        },
        400: { description: 'Validation error' }
    }
});
const getBrandingRoute = createRoute({
    method: 'get',
    path: '/config',
    tags: ['Branding'],
    request: {
        query: GetBrandingConfigQuery
    },
    responses: {
        200: {
            description: 'Branding config fetched',
            content: {
                'application/json': {
                    schema: z.object({ res: brandingConfigSchema })
                }
            }
        },
        400: { description: 'Validation error' },
        404: { description: 'Not found' }
    }
});
// Multipart form schema for update (json part + optional image files)
const multipartBrandingUpdateSchema = z.object({
    json: z.string().openapi({ description: 'Stringified JSON matching BrandingConfigUpdateBody' }),
    logo: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Logo image (png/jpeg/webp)' }),
    logoWhite: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'White logo image (png/jpeg/webp)' }),
    connectCardBackground: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Background image (png/jpeg/webp)' }),
    bannerOverlay: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Banner overlay (png/jpeg/webp)' }),
    favicon: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Favicon (png/jpeg/webp)' })
}).partial();
// PATCH /config?ssid=SSID - partial update (JSON or multipart)
const updateBrandingRoute = createRoute({
    method: 'patch',
    path: '/config',
    tags: ['Branding'],
    request: {
        query: GetBrandingConfigQuery,
        body: {
            content: {
                'application/json': { schema: brandingConfigCreateSchema.partial().openapi('BrandingConfigUpdateBody') },
                'multipart/form-data': { schema: multipartBrandingUpdateSchema.openapi('BrandingConfigMultipartUpdate') }
            },
            required: true
        }
    },
    responses: {
        200: {
            description: 'Branding config updated',
            content: {
                'application/json': {
                    schema: z.object({ res: brandingConfigSchema })
                }
            }
        },
        400: { description: 'Validation or file processing error' },
        404: { description: 'Not found' }
    }
});
// GET image route spec
const getBrandingImageRoute = createRoute({
    method: 'get',
    path: '/config/image/{ssid}/{slug}',
    tags: ['Branding'],
    request: {
        params: z.object({
            ssid: z.string().min(1).openapi({ example: 'my-venue-wifi' }),
            slug: z.string().min(1).openapi({ example: 'logo' })
        })
    },
    responses: {
        200: {
            description: 'Branding image binary',
            content: {
                'image/png': { schema: z.any() },
                'image/jpeg': { schema: z.any() },
                'image/webp': { schema: z.any() },
            }
        },
        404: { description: 'Not found' }
    }
});
portalRoute.openapi(createBrandingRoute, async (c) => {
    const body = await c.req.json();
    const parsed = brandingConfigCreateSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400);
    }
    const { APP_DATABASE_URL } = env(c);
    const portalService = new PortalService(APP_DATABASE_URL);
    const newId = await portalService.createBrandingConfig(parsed.data);
    logApp({ event: 'Branding Config Created', data: { id: newId } });
    return c.json({ id: newId });
});
portalRoute.openapi(getBrandingRoute, async (c) => {
    const query = c.req.query();
    const parsed = GetBrandingConfigQuery.safeParse(query);
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error }, 400);
    }
    const { ssid } = parsed.data;
    const { APP_DATABASE_URL } = env(c);
    const portalService = new PortalService(APP_DATABASE_URL);
    try {
        const res = await portalService.getBrandingConfig(ssid);
        return c.json({ res });
    }
    catch {
        return c.json({ error: 'Not found' }, 404);
    }
});
portalRoute.openapi(updateBrandingRoute, async (c) => {
    // Validate query (ssid)
    const query = c.req.query();
    const parsedQuery = GetBrandingConfigQuery.safeParse(query);
    if (!parsedQuery.success) {
        return c.json({ status: 'error', errors: parsedQuery.error }, 400);
    }
    const { ssid } = parsedQuery.data;
    const contentType = c.req.header('content-type') || '';
    const { APP_DATABASE_URL } = env(c);
    const portalService = new PortalService(APP_DATABASE_URL);
    const partialSchema = brandingConfigCreateSchema.partial();
    if (contentType.startsWith('multipart/form-data')) {
        // Multipart path
        const form = await c.req.formData();
        const jsonPart = form.get('json');
        if (!jsonPart || typeof jsonPart !== 'string') {
            return c.json({ status: 'error', error: 'Missing json part' }, 400);
        }
        let jsonData;
        try {
            jsonData = JSON.parse(jsonPart);
        }
        catch {
            return c.json({ status: 'error', error: 'Invalid json part' }, 400);
        }
        const parsedBody = partialSchema.safeParse(jsonData);
        if (!parsedBody.success) {
            return c.json({ status: 'error', errors: parsedBody.error.flatten() }, 400);
        }
        const bodyUpdates = { ...parsedBody.data };
        const fileErrors = [];
        // Iterate file entries
        for (const [field, value] of form.entries()) {
            if (field === 'json')
                continue;
            if (!(value instanceof File))
                continue;
            if (!IMAGE_FIELDS.has(field))
                continue; // ignore unknown image fields silently
            const file = value;
            if (!ALLOWED_MIME.has(file.type)) {
                fileErrors.push({ field, reason: 'Unsupported mime type' });
                continue;
            }
            if (file.size > MAX_FILE_BYTES) {
                fileErrors.push({ field, reason: 'File too large' });
                continue;
            }
            const arrayBuffer = await file.arrayBuffer();
            const dataBuf = Buffer.from(arrayBuffer);
            const slug = field; // derive slug from field name
            if (!validateSlug(slug)) {
                fileErrors.push({ field, reason: 'Invalid derived slug' });
                continue;
            }
            try {
                const stored = await portalService.upsertBrandingImage({ ssid, slug, mimeType: file.type, data: dataBuf });
                bodyUpdates[field] = stored.path;
            }
            catch (e) {
                fileErrors.push({ field, reason: e.message || 'Store failed' });
            }
        }
        if (fileErrors.length > 0) {
            return c.json({ status: 'error', error: 'One or more files failed', fileErrors }, 400);
        }
        try {
            const res = await portalService.updateBrandingConfig(ssid, bodyUpdates);
            logApp({ event: 'Branding Config Updated (multipart)', data: { ssid } });
            return c.json({ res });
        }
        catch {
            return c.json({ error: 'Not found' }, 404);
        }
    }
    else {
        // JSON path (backwards compatible)
        let body;
        try {
            body = await c.req.json();
        }
        catch {
            return c.json({ status: 'error', error: 'Invalid JSON body' }, 400);
        }
        const parsedBody = partialSchema.safeParse(body);
        if (!parsedBody.success)
            return c.json({ status: 'error', errors: parsedBody.error.flatten() }, 400);
        try {
            const res = await portalService.updateBrandingConfig(ssid, parsedBody.data);
            logApp({ event: 'Branding Config Updated', data: { ssid } });
            return c.json({ res });
        }
        catch {
            return c.json({ error: 'Not found' }, 404);
        }
    }
});
// Register image retrieval in OpenAPI
portalRoute.openapi(getBrandingImageRoute, async (c) => {
    const { ssid, slug } = c.req.param();
    const { APP_DATABASE_URL } = env(c);
    const portalService = new PortalService(APP_DATABASE_URL);
    try {
        const { data, mimeType, size, hash, updatedAt } = await portalService.getBrandingImage(ssid, slug);
        c.header('Content-Type', mimeType);
        c.header('Content-Length', String(size));
        c.header('ETag', `"sha256:${hash}"`);
        if (updatedAt)
            c.header('Last-Modified', updatedAt.toUTCString());
        c.header('Cache-Control', 'public, max-age=86400, immutable');
        const ifNoneMatch = c.req.header('if-none-match');
        if (ifNoneMatch && ifNoneMatch.replace(/\"/g, '') === `sha256:${hash}`) {
            return c.body(null, 304);
        }
        return c.body(data);
    }
    catch {
        return c.json({ error: 'Not found' }, 404);
    }
});
