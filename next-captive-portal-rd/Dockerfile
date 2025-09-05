## syntax=docker/dockerfile:1
# Next.js production image (no host node_modules copy). Default port 3001.

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN set -eux; \
  if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  else npm install --no-audit --no-fund; fi

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# ENV NEXT_TELEMETRY_DISABLED=1
# COPY --from=deps /app/node_modules ./node_modules
# Copy env file(s) first so changes bust cache intentionally; build relies ONLY on .env values
# COPY .env* ./
# Copy application source
# COPY . .
# Optional: show key public env vars for debugging (avoid secrets)
# RUN echo "Loaded env (public vars only):" && grep -E '^(NEXT_PUBLIC_|SITE_|BRAND_|USE_SEED_DATA|MIKROTIK_)' .env || true && npx next build

# Accept build-time overrides (useful in CI) – defaults here if not provided.
ARG NEXT_PUBLIC_SSID=Jozi-wifi
ARG NEXT_PUBLIC_HOTSPOT_API_BASE_URL=http://localhost:3000/api/portal/config/image
ENV NEXT_PUBLIC_SSID=${NEXT_PUBLIC_SSID} \
  NEXT_PUBLIC_HOTSPOT_API_BASE_URL=${NEXT_PUBLIC_HOTSPOT_API_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
# Copy only env + source to leverage Docker layer caching more efficiently
COPY .env* ./
COPY . .
RUN echo "Using NEXT_PUBLIC_SSID=${NEXT_PUBLIC_SSID}" && npx next build


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]