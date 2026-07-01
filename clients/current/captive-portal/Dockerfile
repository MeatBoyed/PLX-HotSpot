## syntax=docker/dockerfile:1.5

# ── Stage 1: install dependencies ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 6 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 600000
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --legacy-peer-deps

# ── Stage 2: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat

ARG SHARED_BUILD_ENV_FILE=docker/env/.env.shared
ARG BUILD_ENV_FILE=docker/env/dev.env

COPY --from=deps /app/node_modules ./node_modules

COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY public ./public
COPY src ./src

COPY ${SHARED_BUILD_ENV_FILE} ./.env.shared.build
COPY ${BUILD_ENV_FILE} ./.env.site.build
RUN cat ./.env.shared.build ./.env.site.build > ./.env

RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN apk add --no-cache libc6-compat

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
