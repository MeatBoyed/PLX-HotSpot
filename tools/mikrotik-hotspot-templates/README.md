# MikroTik Hotspot Templates

Upload these to each hotspot profile's `html-directory` on the core MikroTik (`/files` → the profile's directory, e.g. `hotspot-kwamaimai/`), replacing the existing files of the same name:

- `login.html` — entry point, posts to `POST /gateway/login`
- `alogin.html` — success result, posts to `POST /gateway/login-result`
- `error.html` — failure result (covers every error in `errors.txt`, not just RADIUS rejects), posts to `POST /gateway/login-result`

All three POST MikroTik's `$(...)` template variables to the AuraConnect API and let the API's response (not the template itself) decide where the browser ends up next — see the "MikroTik Captive-Portal Entry & Login-Result Handler" plan for the full request-flow rationale.

**This is unverified against a real device.** Roll out to one hotspot profile first, do a real connect, and check the API's Seq logs (`Gateway login payload` / `Gateway login-result payload`) for the actual field names/values MikroTik sends before rolling out further — the `$(...)` variable names here are based on documented MikroTik hotspot variables and the existing `login-dirk.html`/`errors.txt` on this device, not a confirmed live capture.
