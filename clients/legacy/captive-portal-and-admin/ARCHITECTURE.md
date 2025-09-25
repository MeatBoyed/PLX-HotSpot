## Branding Fetch Lifecycle (MVP)

Layered approach ensures fast first paint, minimal network chatter, and simple future extensibility.

### Flow
1. Server Root Layout calls `BrandingService.get(ssid)`.
2. BrandingService returns cached config (<= 3 min old) or fetches via OpenAPI (`hotspotAPI.getApiportalconfig`).
3. Normalization (`normalizeBranding`) merges backend payload with `pluxnetTheme` defaults.
4. Result passed to `<ThemeProvider initialTheme=...>`.
5. ThemeProvider paints immediately (no spinner) and persists to `localStorage` under `branding:<ssid>`.
6. Client effect background-refreshes only if:
   - No `initialTheme` provided, OR
   - Provided theme is stale (> 6 min old).
7. Updated theme (if fetched) replaces context & localStorage atomically.

### Caching
| Layer                        | TTL     | Purpose                                     |
| ---------------------------- | ------- | ------------------------------------------- |
| In-process (BrandingService) | 3 min   | Avoid repeated backend hits across requests |
| Client freshness window      | 6 min   | Limit background refresh frequency          |
| LocalStorage                 | Session | Instant paint on navigations with same SSID |

### De-duplication
Concurrent server requests for the same SSID share a single in-flight Promise in the service cache.

### Error Handling
Service exceptions -> layout supplies no `initialTheme` -> ThemeProvider falls back to `pluxnetTheme` silently.
Client refresh errors are swallowed; last good theme retained.

### Extensibility Hooks
| Need                 | Change                                                |
| -------------------- | ----------------------------------------------------- |
| Redis / KV cache     | Replace `cache` Map in BrandingService                |
| ETag support         | Store `etag` in cache entry; send conditional request |
| Multi-tenant theming | Key by `${tenant}:${ssid}`                            |
| Metrics              | Wrap fetch and log duration                           |

### Dev Utilities
`BrandingService._clearCache()` clears in-process cache (disabled in production).

### Security Considerations
Only non-secret branding fields exposed client-side. Sensitive / administrative fields must not be added to `BrandingConfig` without review.

---

## Connect / Auth Button Embedding (MVP)

### Goal
Provide form-based hotspot login (free or voucher) with optional ad gating while keeping presentation components (`plan-card`) simple.

### Layers
| Layer                        | Responsibility                              |
| ---------------------------- | ------------------------------------------- |
| AuthService                  | Builds credentials + login URL (no network) |
| ConnectProvider              | State machine (idle → ad → ready) + gating  |
| login-form-button components | Embed provider and render forms / buttons   |

### Flow (Free)
1. User clicks Free button.
2. If `adGateEnabled` and first attempt → state `ad`, disable button.
3. After ad completion (`onAdComplete`) → credentials built, state `ready`.
4. Second click (MVP) submits hidden credential form to Mikrotik.

### Flow (Voucher)
1. User enters voucher and submits.
2. Same gating logic as free path.
3. Credentials = voucher code for both username & password.

### Design Choices
- Provider embedded per button for simplicity (shared instance defer).
- Programmatic form submit only when credentials ready.
- No toasts or navigation in provider (hotspot redirect handles UX).

### Extensibility
| Feature              | Future Change                                            |
| -------------------- | -------------------------------------------------------- |
| Auto-submit after ad | Call `submit()` inside `onAdComplete` if credentials set |
| Shared provider      | Hoist `<ConnectProvider>` around multiple buttons        |
| API-based auth       | Add methods to AuthService without changing buttons      |

