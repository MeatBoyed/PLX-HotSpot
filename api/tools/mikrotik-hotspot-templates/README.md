# MikroTik Hotspot Templates

Upload these to each hotspot profile's `html-directory` on the core MikroTik (`/files` → the profile's directory, e.g. `hotspot-kwamaimai/`), replacing the existing files of the same name:

- `login.html` — entry point. Follows the same `$(if error == '') ... $(else) ...` pattern as the existing `login-dirk.html`: the no-error branch posts to `POST /gateway/login` (first hotspot hit); the error branch posts to `POST /gateway/login-result` (a login attempt submitted through this same page failed), so a failed retry gets captured without ever leaving this file.
- `alogin.html` — success result, posts to `POST /gateway/login-result`
- `error.html` — MikroTik's generic fallback for hotspot errors *not* tied to a fresh `login.html` submission (visiting status/logout while logged out, session/uptime limits, shutting-down — everything else in `errors.txt`). Posts to `POST /gateway/login-result`.

All three POST MikroTik's `$(...)` template variables to the AuraConnect API and let the API's response (not the template itself) decide where the browser ends up next. Each also includes a `noscript` warning + a visible "continue" submit button, so a client with JavaScript disabled can still proceed manually instead of getting stuck — same pattern as `login-dirk.html`.

**`login.html`'s `/gateway/login` branch has been confirmed working against a real device** (mac/nasid/link URLs captured, site resolved, redirect followed through to the real captive portal — see Seq). The error branch of `login.html`, and `alogin.html`/`error.html`'s `/gateway/login-result` posts, are not yet confirmed live — roll out incrementally and check Seq (`Gateway login payload` / `Gateway login-result payload`) before trusting the MAC-correlation outcome end to end.
