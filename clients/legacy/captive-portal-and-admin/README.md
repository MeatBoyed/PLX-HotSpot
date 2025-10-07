This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Runtime vs Build-time environment variables

This app uses T3 Env (`src/env.ts`) to validate environment variables for both server and client.

- Server-only variables (in the `server` block of `src/env.ts`) are read at runtime. Updating these in `.env` and restarting the container is sufficient. Examples:
	- `PAYFAST_*`, `RADIUSDESK_*`, `MIKROTIK_RADIUS_DESK_BASE_URL`, `VOUCHER_DEFAULT_TTL_HOURS`, `USE_SEED_DATA`, `SITE_TITLE`, `SITE_DESCRIPTION`, `BRAND_NAME`.

- Public/client variables (prefixed with `NEXT_PUBLIC_`) are compiled into the client bundle at build time. Changing these requires rebuilding the image. Examples:
	- `NEXT_PUBLIC_SSID`, `NEXT_PUBLIC_MIKROTIK_*`, `NEXT_PUBLIC_BASE_URL`.

Rule of thumb:
- Change only server vars → restart container (no rebuild required).
- Change any `NEXT_PUBLIC_*` or anything that affects build output → rebuild image.

## Docker: build and run

The Dockerfile copies `.env` into the build stage so Next can inline any required build-time values. At runtime, Compose injects environment variables from `.env` into the container process.

Development (rebuild on changes):

```bash
docker compose up --build -d
```

Production (use prebuilt image):

1) Build the image locally (or pull from your registry):

```bash
docker build -t vv-hotspot:latest .
```

2) Run with the production compose file:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Notes:
- Ensure `.env` exists at the project root. It is used at both build time (baked where needed) and runtime (via Compose `env_file`).
- Changing `NEXT_PUBLIC_*` after an image is built will not affect the already built client code; rebuild the image to apply.
- Server-only changes (e.g., PayFast or RadiusDesk tokens/IDs) can be applied by updating `.env` and restarting the container.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
