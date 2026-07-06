Here's a clean markdown documentation of the API routes:

## API Routes Documentation

### Base URL
```
http://your-api-host.com/api
```

### Tenant/Site Resolution
All endpoints require one of the following to identify the hotspot site:
- Header: `X-SSID: joburg-theatre`
- Query parameter: `?ssid=joburg-theatre`

---

## Public Endpoints (Captive Portal)

### Portal & Branding

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/portal/branding` | Get site branding (colors, logos, text content, ad config) |
| `GET` | `/portal/auth-methods` | Get enabled authentication methods for this site |
| `GET` | `/packages` | List available internet packages |

### SMS Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/sms/request` | Request OTP code to be sent via SMS |
| `POST` | `/auth/sms/verify` | Verify OTP code and activate internet session |

### Other Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/free` | Activate free internet session |
| `POST` | `/auth/voucher` | Redeem voucher code and activate session |

### Marketing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/marketing/opt-in` | Submit email for marketing consent |
| `POST` | `/marketing/unsubscribe` | Opt-out from marketing emails |

---

## Admin Endpoints

### Tenant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/tenants` | List all tenants |
| `POST` | `/admin/tenants` | Create new tenant |
| `GET` | `/admin/tenants/{id}` | Get tenant details |
| `PUT` | `/admin/tenants/{id}` | Update tenant |
| `DELETE` | `/admin/tenants/{id}` | Delete tenant |

### Site Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/tenants/{tenantId}/sites` | List all sites for a tenant |
| `POST` | `/admin/tenants/{tenantId}/sites` | Create new site |
| `GET` | `/admin/sites/{siteId}` | Get site details |
| `PUT` | `/admin/sites/{siteId}` | Update site |
| `DELETE` | `/admin/sites/{siteId}` | Delete site |
| `PUT` | `/admin/sites/{siteId}/status` | Update site status (active/suspended/maintenance) |

### Branding Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/sites/{siteId}/branding` | Get branding configuration |
| `PUT` | `/admin/sites/{siteId}/branding` | Update full branding configuration |
| `PUT` | `/admin/sites/{siteId}/branding/colors` | Update only color scheme |
| `PUT` | `/admin/sites/{siteId}/branding/images` | Update image URLs |
| `PUT` | `/admin/sites/{siteId}/branding/content` | Update text content |

### Package Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/sites/{siteId}/packages` | List all packages for a site |
| `POST` | `/admin/sites/{siteId}/packages` | Create new package |
| `GET` | `/admin/packages/{packageId}` | Get package details |
| `PUT` | `/admin/packages/{packageId}` | Update package |
| `DELETE` | `/admin/packages/{packageId}` | Delete package |
| `PATCH` | `/admin/packages/{packageId}/toggle` | Enable/disable package |

### Ads Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/sites/{siteId}/ads` | Get ads configuration |
| `PUT` | `/admin/sites/{siteId}/ads` | Update ads configuration |

### RADIUS Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/sites/{siteId}/radius` | Get RADIUS server configuration |
| `PUT` | `/admin/sites/{siteId}/radius` | Update RADIUS configuration |
| `POST` | `/admin/sites/{siteId}/radius/test` | Test RADIUS connection |

### Reporting

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/sites/{siteId}/reports/summary` | Get daily/weekly connection summary |
| `GET` | `/admin/sites/{siteId}/reports/marketing` | Export marketing opt-in list |
| `GET` | `/admin/sites/{siteId}/reports/otp` | Get SMS OTP request logs |

### Voucher Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/sites/{siteId}/vouchers/generate` | Generate batch of voucher codes |
| `GET` | `/admin/sites/{siteId}/vouchers` | List all vouchers |
| `GET` | `/admin/sites/{siteId}/vouchers/export` | Export vouchers as CSV |
| `POST` | `/admin/sites/{siteId}/vouchers/revoke` | Revoke voucher codes |

---

## Webhook Endpoints (External Services)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhooks/payfast/ipn` | PayFast payment notification |
| `POST` | `/webhooks/sms/status` | SMS delivery status callback |

---

## Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "requestId": "req_123e4567"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `SITE_NOT_FOUND` | SSID or domain does not match any active site |
| `INVALID_OTP` | OTP code is incorrect or expired |
| `MAX_ATTEMPTS_EXCEEDED` | Too many failed OTP verification attempts |
| `VOUCHER_INVALID` | Voucher code does not exist or is expired |
| `VOUCHER_ALREADY_USED` | Voucher has already been redeemed |
| `SESSION_ACTIVE` | MAC address already has an active session |
| `RADIUS_CONNECTION_FAILED` | Cannot connect to RADIUS server |
| `RADIUS_REJECTED` | RADIUS server rejected the authentication request |
| `INVALID_PACKAGE` | Package ID does not exist or is inactive |
| `SMS_SEND_FAILED` | Failed to send SMS via provider |
| `RATE_LIMITED` | Too many requests (when implemented) |

---

## Notes

- All endpoints (public and admin) require tenant/site resolution via `X-SSID` header or `ssid` query parameter
- Admin endpoints will require authentication (to be implemented in Phase 2)
- All responses include a `requestId` in the response headers for log correlation
- RADIUS session activation, voucher validation, and SMS sending will be implemented as separate services