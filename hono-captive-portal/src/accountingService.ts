import { and, desc, eq, isNull, like, sql } from 'drizzle-orm'
import type { MySql2Database } from 'drizzle-orm/mysql2'
import { createDb } from './db/index.js'
import { profiles, radacct, radgroupcheck, vouchers } from './db/schema.js'
import type { FetchUsageResult } from './types.js'


export class AccountingService {
    private db: MySql2Database

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl)
    }

    async fetchUsage(nasipaddress: string, username?: string, debug = 0): Promise<FetchUsageResult> {
        // 1) Latest active session by nasipaddress (and username if provided)
        const sessionRow = await this.db
            .select({
                username: radacct.username,
                mac: radacct.callingstationid,
                ip: radacct.framedipaddress,
                bytes_in: sql<number>`COALESCE(${radacct.acctinputoctets}, 0)`,
                bytes_out: sql<number>`COALESCE(${radacct.acctoutputoctets}, 0)`,
                groupname: radacct.groupname,
                nasipaddress: radacct.nasipaddress,
                acctstarttime: radacct.acctstarttime,
                acctsessiontime: radacct.acctsessiontime,
            })
            .from(radacct)
            .where(
                and(
                    isNull(radacct.acctstoptime), // Only select users with an Active session.
                    eq(radacct.nasipaddress, nasipaddress),
                    username && username !== '' ? eq(radacct.username, username) : sql`1=1`
                )
            )
            .orderBy(desc(radacct.acctstarttime))
            .limit(1)
            .then((rows) => rows[0] ?? null)

        // 2) Voucher lookup by username
        const effectiveUsername = username && username !== '' ? username : sessionRow?.username ?? ''
        let voucherProfileId: number | null = null
        if (effectiveUsername !== '') {
            const v = await this.db
                .select({ profile_id: vouchers.profile_id })
                .from(vouchers)
                .where(eq(vouchers.name, effectiveUsername))
                .limit(1)
            voucherProfileId = v[0]?.profile_id ?? null
        }

        // 3 & 4) Resolve profile and limits
        let profile: FetchUsageResult['profile'] = null
        let profileId: number | null = null

        if (voucherProfileId) {
            profileId = voucherProfileId
            const pr = await this.db
                .select({ id: profiles.id, name: profiles.name, created: profiles.created, modified: profiles.modified })
                .from(profiles)
                .where(eq(profiles.id, profileId))
                .limit(1)
            profile = pr[0] ? { ...pr[0] } : null
        } else if (sessionRow?.groupname && /^SimpleAdd_(\d+)$/.test(sessionRow.groupname)) {
            const pid = Number(sessionRow.groupname.split('_')[1])
            profileId = pid
            const pr = await this.db
                .select({ id: profiles.id, name: profiles.name, created: profiles.created, modified: profiles.modified })
                .from(profiles)
                .where(eq(profiles.id, profileId))
                .limit(1)
            profile = pr[0] ? { ...pr[0] } : null
        }

        const limits = { data_cap_bytes: null as number | null, reset_type: null as string | null, cap_type: null as string | null, mac_counter: null as string | null, raw: [] as any[] }

        if (profileId) {
            const group = `SimpleAdd_${profileId}`
            const rows = await this.db
                .select({ id: radgroupcheck.id, groupname: radgroupcheck.groupname, attribute: radgroupcheck.attribute, op: radgroupcheck.op, value: radgroupcheck.value })
                .from(radgroupcheck)
                .where(eq(radgroupcheck.groupname, group))
                .orderBy(radgroupcheck.id)

            for (const r of rows) {
                if (r.attribute === 'Rd-Total-Data') {
                    limits.data_cap_bytes = r.value ? Number(r.value) : null
                } else if (r.attribute === 'Rd-Reset-Type-Data') {
                    limits.reset_type = r.value ?? null
                } else if (r.attribute === 'Rd-Cap-Type-Data') {
                    limits.cap_type = r.value ?? null
                } else if (r.attribute === 'Rd-Mac-Counter-Data') {
                    limits.mac_counter = r.value ?? null
                }
            }
            limits.raw = rows as any
        }

        return { session: sessionRow as any, profile, profile_id: profileId, limits }
    }

    /**
     * Query RadiusDesk Cake4 endpoint for depleted flag (boolean) for a given username and MAC.
     * Returns true/false if available, or null if unknown/error.
     */
    async fetchServerDepleted(
        username?: string,
        mac?: string,
        baseUrl: string = 'https://radiusdesk.pluxnet.co.za'
    ): Promise<boolean | null> {
        if (!username || !mac) return null
        const url = `${baseUrl}/cake4/rd_cake/radaccts/get-usage.json?username=${encodeURIComponent(username)}&mac=${encodeURIComponent(mac)}`
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        try {
            const res = await fetch(url, { method: 'GET', signal: controller.signal })
            if (!res.ok) return null
            const data: any = await res.json().catch(() => null)
            if (data && data.success && data.data && typeof data.data.depleted !== 'undefined') {
                return Boolean(data.data.depleted)
            }
            return null
        } catch (_e) {
            return null
        } finally {
            clearTimeout(timeout)
        }
    }
}
