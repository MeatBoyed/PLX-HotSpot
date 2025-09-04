## syntax=docker/dockerfile:1.7
# Multi-stage image for the Hono server only (ignores frontend). Entry: server/app.ts -> dist/app.js

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
# Install prod deps separately for smaller runtime image
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM base AS build
ENV NODE_ENV=development
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --no-audit --no-fund
COPY server ./server
COPY drizzle.config.ts* ./
# Compile TS (outputs to dist/ per server/tsconfig outDir)
RUN npm run build

FROM base AS runner
WORKDIR /app
# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
# Copy compiled server output only
COPY --from=build /app/dist ./dist
# Create logs directory (log files are written relative to process CWD)
RUN mkdir -p /app/logs

# Default port (can override with -e PORT=xxxx)
ENV PORT=3000
EXPOSE 3000

# Run the compiled Hono server
CMD ["node", "dist/app.js"]
