# e2e (Playwright)

On-demand end-to-end smokes that drive a **real browser** against an
**already-running app**. The suite does **not** spin the app up — start it
yourself first (in a separate console / your process manager).

## Run model

The suite does **not** manage the server — start it first (`make dev`). If nothing is
listening at the target, the suite fails. That's the contract.

**Target:** `http://localhost:$DEV_PORT` — the same `DEV_PORT` the dev server binds
(one port var, set in `.env.local`).

| Who runs it | What works |
|-------------|------------|
| **You, locally** (server up via `make dev`) | both tests, incl. the browser smoke |
| **Claude Code agent** | only the HTTP smoke — a sandboxed browser can't reach host loopback (`ERR_NAME_NOT_RESOLVED`); Node/curl can |

## Run

```bash
# start the app first (separate console)
make dev

# run the suite against it
make e2e            # or: npm run test:e2e
```

## Tests

- `smoke.spec.ts`
  - **browser**: `page.goto('/')` → 200 + title + non-empty body (the real e2e).
  - **http**: `request.get('/')` → 200 + HTML (Node networking; agent-runnable smoke).

Tests must clean up any data they create. The current smokes create none (public
landing page).
