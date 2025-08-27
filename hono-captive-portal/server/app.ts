import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logAccess, logApp } from './logger.js'
// Routes
import { accountingRoute } from './AccountingService/route.js'
import { portalRoute } from './PortalService/route.js'
import { serveStatic } from '@hono/node-server/serve-static'

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


// Mount service routes under /api
app.route('/api', accountingRoute)
app.route('/api/portal', portalRoute)


app.get('*', serveStatic({ root: './frontend/dist' }))
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
