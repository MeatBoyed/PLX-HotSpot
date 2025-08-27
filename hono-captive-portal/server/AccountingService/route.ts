import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { AccountingService } from './AccountingService.js'
import { UsageQuerySchema, DepletedQuerySchema } from '../radius-schemas.js'
import { logApp } from '../logger.js'

export const accountingRoute = new Hono()

// /api/usage
accountingRoute.get('/usage', async (c) => {
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)
    const query = c.req.query()
    const parsed = UsageQuerySchema.safeParse(query)
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400)
    }
    const { nasipaddress, username } = parsed.data
    const service = new AccountingService(DATABASE_URL)
    const result = await service.fetchUsage(nasipaddress, username)
    logApp({ event: 'usage.result', params: { nasipaddress, username }, result })
    const response = {
        status: 'success' as const,
        params: { nasipaddress, username: username || null },
        data: {
            session: result.session,
            profile: result.profile,
            profile_id: result.profile_id,
            limits: {
                data_cap_bytes: result.limits.data_cap_bytes,
                reset_type: result.limits.reset_type,
                cap_type: result.limits.cap_type,
                mac_counter: result.limits.mac_counter,
            },
            depleted: null as boolean | null,
        },
    }
    c.header('Cache-Control', 'no-store')
    logApp({ event: 'usage.response', response })
    return c.json(response)
})

// /api/depleted
accountingRoute.get('/depleted', async (c) => {
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)
    const FREE_USE_PROFILE_USERNAME = 'click_to_connect'
    const query = c.req.query()
    const parsed = DepletedQuerySchema.safeParse(query)
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400)
    }
    const { mac } = parsed.data
    const service = new AccountingService(DATABASE_URL)
    const depleted = await service.fetchServerDepleted(FREE_USE_PROFILE_USERNAME, mac)
    logApp({ event: 'depleted.result', params: { FREE_USE_PROFILE_USERNAME, mac }, depleted })
    c.header('Cache-Control', 'no-store')
    const response = { status: 'success' as const, data: { depleted } }
    logApp({ event: 'depleted.response', response })
    return c.json(response)
})
