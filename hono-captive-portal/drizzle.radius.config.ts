import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Radius (MySQL) database drizzle config
export default defineConfig({
    out: './drizzle/radius',
    schema: './server/db/radius-schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.RADIUS_DATABASE_URL || process.env.DATABASE_URL!,
    },
});
