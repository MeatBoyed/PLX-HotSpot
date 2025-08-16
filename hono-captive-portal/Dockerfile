# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev || npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci || npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
COPY drizzle.config.ts* ./
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
# ensure logs dir exists
RUN mkdir -p /app/logs
EXPOSE 3000
CMD ["node", "dist/src/server.js"]
