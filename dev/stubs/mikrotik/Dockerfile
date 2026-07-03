# MikroTik RouterOS REST stub — dev-only HTTPS emulator (AAA slice 2026-07-03--01, stub A).
# Copies the workspace as-is, including its local node_modules (fastify is pure JS, so no
# rebuild/native step needed) and the committed self-signed cert. No install runs in the
# image — the deps are already resolved by the monorepo's single root yarn.lock.
FROM node:22.20.0-alpine
WORKDIR /app
COPY . .
ENV PORT=8443
ENV LOGIN_PORT=8080
EXPOSE 8443 8080
CMD ["node", "server.mjs"]
