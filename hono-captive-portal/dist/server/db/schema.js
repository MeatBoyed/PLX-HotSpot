import { mysqlTable, int, varchar, bigint, datetime, text, } from 'drizzle-orm/mysql-core';
// Minimal table definitions required for the usage endpoint
export const radacct = mysqlTable('radacct', {
    username: varchar('username', { length: 255 }).notNull(),
    callingstationid: varchar('callingstationid', { length: 64 }).notNull(),
    framedipaddress: varchar('framedipaddress', { length: 64 }).notNull(),
    acctinputoctets: bigint('acctinputoctets', { mode: 'number' }),
    acctoutputoctets: bigint('acctoutputoctets', { mode: 'number' }),
    groupname: varchar('groupname', { length: 255 }),
    nasipaddress: varchar('nasipaddress', { length: 64 }).notNull(),
    acctstarttime: datetime('acctstarttime', { mode: 'string' }),
    acctsessiontime: int('acctsessiontime'),
    acctstoptime: datetime('acctstoptime', { mode: 'string' }),
});
export const vouchers = mysqlTable('vouchers', {
    name: varchar('name', { length: 255 }).notNull(),
    profile_id: int('profile_id'),
});
export const profiles = mysqlTable('profiles', {
    id: int('id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    created: datetime('created', { mode: 'string' }),
    modified: datetime('modified', { mode: 'string' }),
});
export const radgroupcheck = mysqlTable('radgroupcheck', {
    id: int('id').notNull(),
    groupname: varchar('groupname', { length: 255 }).notNull(),
    attribute: varchar('attribute', { length: 255 }).notNull(),
    op: varchar('op', { length: 8 }),
    value: text('value'),
    created: datetime('created', { mode: 'string' }),
    modified: datetime('modified', { mode: 'string' }),
});
