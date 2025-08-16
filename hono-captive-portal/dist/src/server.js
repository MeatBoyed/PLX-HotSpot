import 'dotenv/config';
import { env } from 'hono/adapter';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { AccountingService } from './accountingService.js';
import { UsageQuerySchema, UsageResponseSchema } from './types.js';
const app = new Hono();
// Usage endpoint migrated from PHP usage.php
app.get('/api/usage', async (c) => {
    const { DATABASE_URL } = env(c);
    const query = c.req.query();
    const parsed = UsageQuerySchema.safeParse(query);
    if (!parsed.success) {
        return c.json({ status: 'error', errors: parsed.error.flatten() }, 400);
    }
    const { nasipaddress, username, debug } = parsed.data;
    const service = new AccountingService(DATABASE_URL);
    const result = await service.fetchUsage(nasipaddress, username, debug);
    const response = {
        status: 'success',
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
            depleted: null,
        },
    };
    // Validate response shape at runtime in debug mode only
    if (debug) {
        const ok = UsageResponseSchema.safeParse(response);
        if (!ok.success) {
            return c.json({ status: 'error', errors: ok.error.flatten() }, 500);
        }
    }
    c.header('Cache-Control', 'no-store');
    return c.json(response);
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
