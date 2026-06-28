import { drizzle as drizzleMySql } from 'drizzle-orm/mysql2';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
export function createRadiusDb(url) {
    const pool = mysql.createPool({ uri: url, waitForConnections: true, connectionLimit: 10 });
    return drizzleMySql(pool);
}
export function createAppDb(url) {
    // For now we use a simple Pool; adjust config as needed (SSL, etc.)
    const pool = new Pool({ connectionString: url });
    return drizzlePg(pool);
}
