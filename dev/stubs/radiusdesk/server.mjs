// RadiusDesk rd_cake stub — HTTP entrypoint (AAA slice 2026-07-03--01, stub C).
// Serves buildApp() over plain HTTP on $PORT (default 8080) — RadiusDesk's base URL is
// fully configurable, so no TLS is needed. This is the process the compose `radiusdesk`
// service runs.
import { buildApp } from './app.mjs';

const port = Number(process.env.PORT ?? 8080);

const app = buildApp();
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  console.error(err);
  process.exit(1);
});
