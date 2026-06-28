import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first (the documented local-dev bootstrap target) so the
// Prisma CLI reads the same DATABASE_URL Next.js does, then fall back to .env
// for any vars not overridden locally. dotenv does not overwrite already-set
// keys, so .env.local wins.
config({ path: ".env.local" });
config();

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});