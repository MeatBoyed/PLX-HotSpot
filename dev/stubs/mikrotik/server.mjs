// MikroTik REST stub — HTTPS entrypoint (AAA slice 2026-07-03--01, stub A).
// Loads the dev-only self-signed cert and serves buildApp() over TLS on $PORT (default
// 8443). This is the process the compose `mikrotik` service runs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildApp } from './app.mjs';
import { buildLoginApp } from './login.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const https = {
  key: readFileSync(join(here, 'certs', 'key.pem')),
  cert: readFileSync(join(here, 'certs', 'cert.pem')),
};
const restPort = Number(process.env.PORT ?? 8443);       // REST API — HTTPS
const loginPort = Number(process.env.LOGIN_PORT ?? 8080); // hotspot /login — plain HTTP

const fail = (err) => { console.error(err); process.exit(1); };

// One RouterOS "system", two surfaces: the HTTPS REST API and the plain-HTTP hotspot
// login page. Run both listeners in this single container (ADR 0005: one service/system).
buildApp({ https }).listen({ port: restPort, host: '0.0.0.0' }).catch(fail);
buildLoginApp().listen({ port: loginPort, host: '0.0.0.0' }).catch(fail);
