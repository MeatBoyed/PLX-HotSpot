import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { logApp } from '../logger.js'
import { setCookie } from 'hono/cookie'
import { brandingConfigCreateSchema, GetBrandingConfigQuery, brandingConfigSchema } from '../app-schemas.js'
import { PortalService } from './PortalService.js'
import { env } from 'hono/adapter'

export const portalRoute = new OpenAPIHono()

// /api/hook/login
portalRoute.post('/hook/login', async (c: any) => {
    const rawRequest = c.req.raw
    const formData = await c.req.formData()
    const mikrotikData = Object.fromEntries(formData.entries())
    const data = { rawRequest, formData, mikrotikData }
    logApp({ event: 'MT Login Hook Accessed', data })
    setCookie(c, 'mikrotik-data', JSON.stringify(mikrotikData), {
        path: '/',
        maxAge: 60 * 50,
    })
    return c.redirect('/')
})

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
})

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
})

portalRoute.openapi(createBrandingRoute, async (c: any) => {
    const body = await c.req.json()
    const parsed = brandingConfigCreateSchema.safeParse(body)
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400)
    }
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    const newId = await portalService.createBrandingConfig(parsed.data)
    logApp({ event: 'Branding Config Created', data: { id: newId } })
    return c.json({ id: newId })
})

portalRoute.openapi(getBrandingRoute, async (c: any) => {
    const query = c.req.query()
    const parsed = GetBrandingConfigQuery.safeParse(query)
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error }, 400)
    }
    const { ssid } = parsed.data
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    try {
        const res = await portalService.getBrandingConfig(ssid)
        return c.json({ res })
    } catch {
        return c.json({ error: 'Not found' }, 404)
    }
})