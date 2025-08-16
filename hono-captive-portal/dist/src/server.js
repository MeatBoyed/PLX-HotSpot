import 'dotenv/config';
import { env } from 'hono/adapter';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { logAccess, logApp } from './logger.js';
import { AccountingService } from './accountingService.js';
import { UsageQuerySchema, DepletedQuerySchema } from './schemas.js';
const app = new Hono();
// Access logging to file and console
app.use('*', async (c, next) => {
    const start = Date.now();
    const ip = c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || c.req.raw.headers.get('x-forwarded-for') || c.req.raw.headers.get('x-real-ip') || '';
    const ua = c.req.header('user-agent') || '';
    await next();
    const ms = Date.now() - start;
    const line = `${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms ip=${ip} ua="${ua.replaceAll('"', '')}"`;
    logAccess(line);
});
app.use('*', honoLogger());
// Usage endpoint migrated from PHP usage.php
app.get('/api/usage', async (c) => {
    const { DATABASE_URL } = env(c);
    const query = c.req.query();
    // Parse the Request (URL) Params
    const parsed = UsageQuerySchema.safeParse(query);
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400);
    }
    // Extract client IP from request headers (same logic as logging middleware)
    const clientIp = c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || c.req.raw.headers.get('x-forwarded-for') || c.req.raw.headers.get('x-real-ip') || '';
    // Use provided nasipaddress if available, otherwise use client IP
    const { nasipaddress, username } = parsed.data;
    const effectiveNasIpAddress = nasipaddress || clientIp;
    if (!effectiveNasIpAddress) {
        return c.json({ status: 'error', message: 'Unable to determine client IP address' }, 400);
    }
    // Extract and Fetch Usage data
    const service = new AccountingService(DATABASE_URL);
    const result = await service.fetchUsage(effectiveNasIpAddress, username);
    logApp({ event: 'usage.result', params: { nasipaddress: effectiveNasIpAddress, username }, result });
    const response = {
        status: 'success',
        params: { nasipaddress: effectiveNasIpAddress, username: username || null },
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
            depleted: null,
        },
    };
    c.header('Cache-Control', 'no-store');
    logApp({ event: 'usage.response', response });
    return c.json(response);
});
// Check if a given username+mac is depleted according to RadiusDesk Cake4
// MAC Address must be in URL Format (%%%)!
app.get('/api/depleted', async (c) => {
    const { DATABASE_URL } = env(c);
    const query = c.req.query();
    const parsed = DepletedQuerySchema.safeParse(query);
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400);
    }
    const { username, mac } = parsed.data;
    const service = new AccountingService(DATABASE_URL);
    const depleted = await service.fetchServerDepleted(username, mac);
    logApp({ event: 'depleted.result', params: { username, mac }, depleted });
    c.header('Cache-Control', 'no-store');
    const response = { status: 'success', data: { depleted } };
    logApp({ event: 'depleted.response', response });
    return c.json(response);
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
