```
npm install
npm run dev
```

```
open http://localhost:3000
```


So I've whitelisted 127.0.0.1 & hotspot.pluxnet.co.za on Nginx
I've also proxied all requests to hotspot.pluxnet.co.za/api to Honojs Backend

I've made the Mariadb run on 0.0.0.0 not 127.0.0.1 - so its accessable remotely
I've created a plx-captiveportal@<ip of hotspot.pluxnet.co.za> db user in maria and allowed access to rd

## still need to do
1. Close all ports (expect for necessary) on Radiusdesk vm & whitelist hotspot.pluxnet.co.za (ip) to access
DB Port only.
2. Disable/remove the radiusdesk.pluxnet.co.za/api/users/usage endpoint
3. Remove NASIPaddress from usage params, don't expose where it comes from....


# Frontend...
1. Dashboard page must GET the Usage data from Hotspot.pluxnet.co.za/api/usage?nasipaddress=
2. Login page must  GET depleted data from hotspot.pluxnet.co.za/api/depelted?username=..&mac=...

---

## Branding Config Image API (New)

### Upload / Update Branding (JSON only)
PATCH /api/portal/config?ssid={ssid}
Content-Type: application/json

Body: Partial BrandingConfigUpdateBody (same keys as create; all optional)

### Upload / Update Branding With Images (Multipart)
PATCH /api/portal/config?ssid={ssid}
Content-Type: multipart/form-data

Form parts:
- json: stringified JSON (same as JSON body above)
- Optional image file fields (any subset): logo, logoWhite, connectCardBackground, bannerOverlay, favicon

Each valid image replaces (overwrites) existing image under slug == field name. Returned config will have the field value set to /{ssid}/{slug}.

Constraints:
- MIME types: image/png, image/jpeg, image/webp
- Max size per file: 20MB
- Overwrite allowed (same slug)
- If any image fails validation or storage, the request returns 400 with fileErrors and no config update is applied.

Example (curl):
```
curl -X PATCH "http://localhost:3000/api/portal/config?ssid=my-venue-wifi" \
	-F 'json={"name":"My Venue WiFi"}' \
	-F 'logo=@/path/to/logo.png;type=image/png' \
	-F 'favicon=@/path/to/favicon.png;type=image/png'
```

### Retrieve Image
GET /api/portal/config/image/{ssid}/{slug}

Returns raw binary with headers: Content-Type, Content-Length, ETag, Cache-Control (public, max-age=86400, immutable).

Example:
```
curl -I http://localhost:3000/api/portal/config/image/my-venue-wifi/logo
```

### Client Usage
Store only the relative path returned (e.g. /my-venue-wifi/logo) and prepend runtime base URL when rendering.

---