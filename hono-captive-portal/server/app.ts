import 'dotenv/config'
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logAccess, logApp } from './logger.js'
// Routes
import { accountingRoute } from './AccountingService/route.js'
import { portalRoute } from './PortalService/route.js'
import { PortalService } from './PortalService/PortalService.js'
import { env } from 'hono/adapter'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new OpenAPIHono()

// CORS (allow local dev frontend and optionally additional origins via env)
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3001')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use('/api/*', cors({
  origin: (origin) => {
    if (!origin) return origin // non-browser / same-origin
    return allowedOrigins.includes(origin) ? origin : ''
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
  maxAge: 600,
}))

// Access logging to file and console
app.use('*', async (c: any, next: any) => {
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

// OpenAPI document (Swagger UI served at /doc)
app.doc('/api/spec', {
  openapi: '3.0.0',
  info: {
    title: 'Captive Portal API',
    version: '1.0.0'
  }
})


// Resolve port from environment (default 3000)
const port = Number(process.env.PORT) || 3000

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
