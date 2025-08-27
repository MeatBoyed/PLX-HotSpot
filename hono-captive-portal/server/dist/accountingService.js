import { and, desc, eq, isNull, like, sql } from 'drizzle-orm';
import { createDb } from './db/index.js';
import { profiles, radacct, radgroupcheck, vouchers } from './db/schema.js';
export class AccountingService {
    db;
    constructor(dbUrl) {
        this.db = createDb(dbUrl);
    }
    async fetchUsage(nasipaddress, username, mac, debug = 0) {
        // 1) Latest active session by nasipaddress (and username if provided)
        const sessionRow = await this.db
            .select({
            username: radacct.username,
            mac: radacct.callingstationid,
            ip: radacct.framedipaddress,
            bytes_in: sql `COALESCE(${radacct.acctinputoctets}, 0)`,
            bytes_out: sql `COALESCE(${radacct.acctoutputoctets}, 0)`,
            groupname: radacct.groupname,
            nasipaddress: radacct.nasipaddress,
            acctstarttime: radacct.acctstarttime,
            acctsessiontime: radacct.acctsessiontime,
        })
            .from(radacct)
            .where(and(isNull(radacct.acctstoptime), // Only select users with an Active session.
        // eq(radacct.nasipaddress, nasipaddress),
        eq(radacct.callingstationid, mac || "")))
            .orderBy(desc(radacct.acctstarttime))
            .limit(1)
            .then((rows) => rows[0] ?? null);
        // 2) Voucher lookup by username
        const effectiveUsername = username && username !== '' ? username : sessionRow?.username ?? '';
        let voucherProfileId = null;
        if (effectiveUsername !== '') {
            const v = await this.db
                .select({ profile_id: vouchers.profile_id })
                .from(vouchers)
                .where(eq(vouchers.name, effectiveUsername))
                .limit(1);
            voucherProfileId = v[0]?.profile_id ?? null;
        }
        // 3 & 4) Resolve profile and limits
        let profile = null;
        let profileId = null;
        if (voucherProfileId) {
            profileId = voucherProfileId;
            const pr = await this.db
                .select({ id: profiles.id, name: profiles.name, created: profiles.created, modified: profiles.modified })
                .from(profiles)
                .where(eq(profiles.id, profileId))
                .limit(1);
            profile = pr[0] ? { ...pr[0] } : null;
        }
        else if (sessionRow?.groupname && /^SimpleAdd_(\d+)$/.test(sessionRow.groupname)) {
            const pid = Number(sessionRow.groupname.split('_')[1]);
            profileId = pid;
            const pr = await this.db
                .select({ id: profiles.id, name: profiles.name, created: profiles.created, modified: profiles.modified })
                .from(profiles)
                .where(eq(profiles.id, profileId))
                .limit(1);
            profile = pr[0] ? { ...pr[0] } : null;
        }
        const limits = { data_cap_bytes: null, reset_type: null, cap_type: null, mac_counter: null, raw: [] };
        if (profileId) {
            const group = `SimpleAdd_${profileId}`;
            const rows = await this.db
                .select({ id: radgroupcheck.id, groupname: radgroupcheck.groupname, attribute: radgroupcheck.attribute, op: radgroupcheck.op, value: radgroupcheck.value })
                .from(radgroupcheck)
                .where(eq(radgroupcheck.groupname, group))
                .orderBy(radgroupcheck.id);
            for (const r of rows) {
                if (r.attribute === 'Rd-Total-Data') {
                    limits.data_cap_bytes = r.value ? Number(r.value) : null;
                }
                else if (r.attribute === 'Rd-Reset-Type-Data') {
                    limits.reset_type = r.value ?? null;
                }
                else if (r.attribute === 'Rd-Cap-Type-Data') {
                    limits.cap_type = r.value ?? null;
                }
                else if (r.attribute === 'Rd-Mac-Counter-Data') {
                    limits.mac_counter = r.value ?? null;
                }
            }
            limits.raw = rows;
        }
        return { session: sessionRow, profile, profile_id: profileId, limits };
    }
    /**
     * Query RadiusDesk Cake4 endpoint for depleted flag (boolean) for a given username and MAC.
     * Returns true/false if available, or null if unknown/error.
     */
    async fetchServerDepleted(username, mac, baseUrl = 'https://radiusdesk.pluxnet.co.za') {
        if (!username || !mac)
            return null;
        const url = `${baseUrl}/cake4/rd_cake/radaccts/get-usage.json?username=${encodeURIComponent(username)}&mac=${encodeURIComponent(mac)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(url, { method: 'GET', signal: controller.signal });
            if (!res.ok)
                return null;
            const data = await res.json().catch(() => null);
            if (data && data.success && data.data && typeof data.data.depleted !== 'undefined') {
                return Boolean(data.data.depleted);
            }
            return null;
        }
        catch (_e) {
            return null;
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
