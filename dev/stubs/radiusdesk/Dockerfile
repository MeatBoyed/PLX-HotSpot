# RadiusDesk rd_cake stub — dev-only HTTP emulator (AAA slice 2026-07-03--01, stub C).
# Copies the workspace as-is, including its local node_modules (fastify is pure JS, no
# rebuild/native step). No install runs in the image — deps are resolved by the monorepo's
# single root yarn.lock.
FROM node:22.20.0-alpine
WORKDIR /app
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
