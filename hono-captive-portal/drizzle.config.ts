import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Default (App) Database: Postgres
export default defineConfig({
    out: './drizzle/app',
    schema: './server/db/app-schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.APP_DATABASE_URL!,
    },
});
