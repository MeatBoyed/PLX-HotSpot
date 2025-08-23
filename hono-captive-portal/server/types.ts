
export type FetchUsageInput = {
    dbUrl: string
    nasipaddress: string
    username?: string
    debug?: number
}

export type FetchUsageResult = {
    session: {
        username: string
        mac: string
        ip: string
        bytes_in: number
        bytes_out: number
        groupname: string | null
        nasipaddress: string
        acctstarttime: string | null
        acctsessiontime: number | null
    } | null
    profile: { id: number; name: string; created?: string | null; modified?: string | null } | null
    profile_id: number | null
    limits: {
        data_cap_bytes: number | null
        reset_type: string | null
        cap_type: string | null
        mac_counter: string | null
        raw?: any[]
    }
}