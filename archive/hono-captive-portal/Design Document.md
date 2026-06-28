# Captive Portal Design Document

## Overview

This document outlines the design, requirements, features, and architecture for a captive portal system to be deployed in a Hotspot environment. The system uses [Hono.js](https://hono.dev/) as the backend framework to handle both API endpoints (for POST requests from MikroTik RouterOS) and to serve static HTML, CSS, and JavaScript files for the user-facing portal.

---

## Requirements

### 1. Technical Requirements

- **Backend Framework**: Hono.js (Node.js-based, lightweight, suitable for serverless and edge deployments)
- **Frontend**: Pre-built static HTML, CSS, and minimal JavaScript
  - No React or SPA frameworks
  - Minimal JS only for authentication and form handling
- **POST Handling**: Backend must capture POST requests from MikroTik RouterOS (MT)
- **Redirection**: After capturing the POST request, users are redirected to the captive portal home page
- **Authentication Flow**: User login form must submit credentials to MT as required by MikroTik’s captive portal protocol
- **Static File Serving**: All portal pages, assets, and resources are to be served as static files via Hono.js
- **Security**: Only minimal and necessary JavaScript; no client-side logic for authentication (handled server-side and by MT)
- **Compatibility**: Must comply with MikroTik (RouterOS) captive portal workflow

---

## Features

- **API Endpoint**
  - `POST /api/capture`: Receives incoming POST requests from MT, handles data capture, and redirects to home page
- **Static File Serving**
  - Serves all files in `/public` (or designated static directory) for portal UI
    - `index.html`: Home page with login (and any other landing information)
    - `dashboard.html`: Dashboard (welcome page) shown after successful login
- **Redirection Logic**
  - On POST capture, issues HTTP redirect (302/303) to `/` (portal home)
- **User Login Form**
  - Pure HTML form, action and method as specified by MikroTik
  - Form submits to MT's login endpoint using required parameters (`username`, `password`, etc.)
- **Minimal JS**
  - Only for dynamic form field handling (if needed), error display, and form validation

---

## Specification

### Backend (Hono.js)

#### Structure

- `/api/capture` (POST): Endpoint for MT to POST session/user data
  - After handling, responds with a redirect to `/`
- `/` (GET): Serves `index.html` (portal home page with login)
- `/dashboard` (GET): Serves `dashboard.html` (dashboard/welcome page)
- `/assets/*` (GET): Serves static CSS, JS, images, etc.

#### Example Hono.js Routing

```js
import { Hono } from 'hono'
import { serveStatic } from 'hono/static'

const app = new Hono()

// API endpoint for MikroTik POST
app.post('/api/capture', async (c) => {
  // Perform any required processing
  return c.redirect('/')
})

// Serve static files from /public
app.use('/*', serveStatic({ root: './public' }))

export default app
```

### Frontend (Static Files)

- **HTML files**: 
  - `index.html` (home, login)
  - `dashboard.html` (dashboard/welcome)
- **Form structure**: 
  - `<form action="[MT login URL]" method="POST">`
  - Inputs for required credentials
- **Minimal JS**: Only for form validation and dynamic feedback

---

## Workflow

1. **User connects to Wi-Fi, is intercepted by MT**
2. **MT sends POST to `/api/capture` on Captive Portal backend**
3. **Hono.js endpoint processes, then issues redirect to `/` (portal home)**
4. **User sees login page served as static HTML (`index.html`)**
5. **User submits login form (HTML POST) to MT**
6. **MT authenticates via RadiusDesk, grants/denies access**
7. **On successful login, user is redirected to `dashboard.html` (dashboard/welcome page)**

---

## Security Considerations

- Serve all resources over HTTPS
- Validate and sanitize any data captured from MT
- Avoid storing sensitive user data unless explicitly needed
- Ensure only required endpoints are exposed

---

**Author**: MeatBoyed  
**Date**: 2025-08-11
