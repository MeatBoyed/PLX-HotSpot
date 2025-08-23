import 'dotenv/config'
import { env } from 'hono/adapter'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logAccess, logApp } from './logger.js'
import { AccountingService } from './accountingService.js'
import { UsageQuerySchema, DepletedQuerySchema } from './schemas.js'
import { serveStatic } from '@hono/node-server/serve-static'
import { setCookie } from 'hono/cookie'

const app = new Hono()

// Access logging to file and console
app.use('*', async (c, next) => {
  const start = Date.now()
  const ip = c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || c.req.raw.headers.get('x-forwarded-for') || c.req.raw.headers.get('x-real-ip') || ''
  const ua = c.req.header('user-agent') || ''
  await next()
  const ms = Date.now() - start
  const line = `${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms ip=${ip} ua="${ua.replaceAll('"', '')}"`
  logAccess(line)
})


// Usage endpoint migrated from PHP usage.php
app.get('/api/usage', async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)
  const query = c.req.query()

  // Parse the Request (URL) Params
  const parsed = UsageQuerySchema.safeParse(query)
  if (!parsed.success) {
    return c.json({ status: 'error', errors: parsed.error.flatten() }, 400)
  }

  // Extract and Fetch Usage data
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

// Check if a given username+mac is depleted according to RadiusDesk Cake4
// MAC Address must be in URL Format (%%%)!
app.get('/api/depleted', async (c) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)
  const FREE_USE_PROFILE_USERNAME = "click_to_connect"
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

app.post("/api/hook/login", async (c) => {
  const rawRequest = c.req.raw
  const formData = await c.req.formData();
  const mikrotikData = Object.fromEntries(formData.entries());
  const data = { rawRequest, formData, mikrotikData }
  logApp({ event: "MT Login Hook Accessed", data })

  // Save Mikrotik data to cookie
  setCookie(c, 'mikrotik-data', JSON.stringify(mikrotikData), {
    path: '/',
    // httpOnly: true,
    // sameSite: 'lax',
    maxAge: 60 * 50, // 50 minutes
  });

  // return c.json({ status: 'success', data })
  return c.redirect("/")
  // return c.json({ status: "success" })
})

app.get('*', serveStatic({ root: './frontend/dist' }))
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
