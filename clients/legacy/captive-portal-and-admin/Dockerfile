## syntax=docker/dockerfile:1.5

FROM node:20-alpine AS deps
WORKDIR /app
# Prisma on alpine needs openssl and libc6-compat
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl

# Install deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app sources
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY prisma ./prisma
COPY public ./public
COPY src ./src

# Important: copy .env so Next has all env at build time (only in builder layer).
# This will not be present in the final runtime image. Ensure .dockerignore allows .env.
COPY .env ./.env

# Generate Prisma client and build Next
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy public (static files)
COPY --from=builder /app/public ./public

# Copy Next standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy generated Prisma client (your schema outputs to ../generated/prisma)
COPY --from=builder /app/generated ./generated

# If you use any runtime assets (e.g., migrations or schema), copy as needed:
# COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
# The standalone output includes server.js at root
CMD ["node", "server.js"]