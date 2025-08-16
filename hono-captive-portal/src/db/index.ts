import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

export function createDb(url: string) {
    const pool = mysql.createPool({ uri: url, waitForConnections: true, connectionLimit: 10 })
    return drizzle(pool)
}
