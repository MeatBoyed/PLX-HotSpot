import { Hono } from 'hono'
import { logApp } from '../logger.js'
import { setCookie } from 'hono/cookie'
import { brandingConfigCreateSchema, GetBrandingConfigQuery } from '../app-schemas.js'
import { PortalService } from './PortalService.js'
import { env } from 'hono/adapter'

export const portalRoute = new Hono()

// /api/hook/login
portalRoute.post('/hook/login', async (c) => {
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

portalRoute.post("/config", async (c) => {
    const query = await c.req.json()
    const parsed = brandingConfigCreateSchema.safeParse(query)
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400)
    }

    // Create service & exec
    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    const newId = await portalService.createBrandingConfig(parsed.data)
    logApp({ event: "Branding Config Created", data: { id: newId } })

    return c.json({ id: newId })
})


portalRoute.get("/config", async (c) => {
    const query = c.req.query()
    const parsed = GetBrandingConfigQuery.safeParse(query)
    if (!parsed.success) {
        return c.json({ status: "error", errors: parsed.error }, 400)
    }
    const { ssid, name } = parsed.data

    const { APP_DATABASE_URL } = env<{ APP_DATABASE_URL: string }>(c)
    const portalService = new PortalService(APP_DATABASE_URL)
    const res = await portalService.getBrandingConfig(ssid, name)
    return c.json({ res })
})