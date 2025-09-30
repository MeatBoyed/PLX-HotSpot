import { OpenAPIHono } from '@hono/zod-openapi'
import { logApp } from '../logger.js'
import { setCookie } from 'hono/cookie'
import { brandingConfigCreateSchema, GetBrandingConfigQuery, brandingConfigSchema } from '../app-schemas.js'
import { PortalService } from './PortalService.js'
import { Hono } from 'hono'
import { buffer } from 'node:stream/consumers'
import { createBrandingRoute, getBrandingRoute, updateBrandingRoute, getBrandingImageRoute, multipartBrandingUpdateSchema } from './openapi.js'
import { ImageService } from './ImageService.js'

// Image processing moved to ImageService
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
        maxAge: 60 * 50
    })
    return c.redirect('/')
})

// OpenAPI route definitions moved to ./openapi.ts

portalRoute.get("/config/all", async (c: any) => {
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    try {
        // const res = await portalService.getAllBrandConfigs()
        // return c.json({ res })
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
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

portalRoute.openapi(updateBrandingRoute, async (c: any) => {
    // Validate query (ssid)
    const query = c.req.query()
    const parsedQuery = GetBrandingConfigQuery.safeParse(query)
    if (!parsedQuery.success) {
        return c.json({ status: 'error', errors: parsedQuery.error }, 400)
    }
    const { ssid } = parsedQuery.data
    const contentType = c.req.header('content-type') || ''
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    const partialSchema = brandingConfigCreateSchema.partial()
    const imageService = new ImageService(portalService)

    if (contentType.startsWith('multipart/form-data')) {
        // Multipart path
        const form = await c.req.formData()
        const jsonPart = form.get('json')
        if (!jsonPart || typeof jsonPart !== 'string') {
            return c.json({ status: 'error', error: 'Missing json part' }, 400)
        }
        let jsonData: any
        try { jsonData = JSON.parse(jsonPart) } catch { return c.json({ status: 'error', error: 'Invalid json part' }, 400) }
        const parsedBody = partialSchema.safeParse(jsonData)
        if (!parsedBody.success) {
            return c.json({ status: 'error', errors: parsedBody.error.flatten() }, 400)
        }
        const bodyUpdates = { ...parsedBody.data }
        const { updates, errors } = await imageService.processFormData(ssid, form)
        Object.assign(bodyUpdates, updates)
        if (errors.length > 0) {
            return c.json({ status: 'error', error: 'One or more files failed', fileErrors: errors }, 400)
        }
        try {
            const res = await portalService.updateBrandingConfig(ssid, bodyUpdates)
            logApp({ event: 'Branding Config Updated (multipart)', data: { ssid } })
            return c.json({ res })
        } catch {
            return c.json({ error: 'Not found' }, 404)
        }
    } else {
        // JSON path (backwards compatible)
        let body: any
        try { body = await c.req.json() } catch { return c.json({ status: 'error', error: 'Invalid JSON body' }, 400) }
        const parsedBody = partialSchema.safeParse(body)
        if (!parsedBody.success) return c.json({ status: 'error', errors: parsedBody.error.flatten() }, 400)
        try {
            const res = await portalService.updateBrandingConfig(ssid, parsedBody.data)
            logApp({ event: 'Branding Config Updated', data: { ssid } })
            return c.json({ res })
        } catch {
            return c.json({ error: 'Not found' }, 404)
        }
    }
})

// Register image retrieval in OpenAPI
portalRoute.openapi(getBrandingImageRoute, async (c: any) => {
    const { ssid, slug } = c.req.param()
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    const imageService = new ImageService(portalService)
    try {
        const { data, mimeType, size, hash, updatedAt } = await imageService.getImage(ssid, slug)
        c.header('Content-Type', mimeType)
        c.header('Content-Length', String(size))
        c.header('ETag', `"sha256:${hash}"`)
        if (updatedAt) c.header('Last-Modified', updatedAt.toUTCString())
        c.header('Cache-Control', 'public, max-age=86400, immutable')
        const ifNoneMatch = c.req.header('if-none-match')
        if (ifNoneMatch && ifNoneMatch.replace(/\"/g, '') === `sha256:${hash}`) {
            return c.body(null, 304)
        }
        return c.body(data)
    } catch {
        return c.json({ error: 'Not found' }, 404)
    }
})