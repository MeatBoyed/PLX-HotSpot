import { createRoute, z } from '@hono/zod-openapi'
import { brandingConfigCreateSchema, GetBrandingConfigQuery, brandingConfigSchema } from '../app-schemas.js'

// Multipart form schema (OpenAPI only)
export const multipartBrandingUpdateSchema = z.object({
    json: z.string().openapi({ description: 'Stringified JSON matching BrandingConfigUpdateBody' }),
    logo: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Logo image (png/jpeg/webp)' }),
    logoWhite: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'White logo image (png/jpeg/webp)' }),
    connectCardBackground: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Background image (png/jpeg/webp)' }),
    bannerOverlay: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Banner overlay (png/jpeg/webp)' }),
    favicon: z.any().optional().openapi({ type: 'string', format: 'binary', description: 'Favicon (png/jpeg/webp)' })
})

export const createBrandingRoute = createRoute({
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
})

export const getBrandingRoute = createRoute({
    method: 'get',
    path: '/config',
    tags: ['Branding'],
    request: { query: GetBrandingConfigQuery },
    responses: {
        200: {
            description: 'Branding config fetched',
            content: {
                'application/json': { schema: z.object({ res: brandingConfigSchema }) }
            }
        },
        400: { description: 'Validation error' },
        404: { description: 'Not found' }
    }
})

export const updateBrandingRoute = createRoute({
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
})

export const getBrandingImageRoute = createRoute({
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
})
