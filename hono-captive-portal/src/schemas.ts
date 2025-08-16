import { z } from 'zod'

export const UsageQuerySchema = z.object({
    nasipaddress: z.string().min(1),
    username: z.string().optional().default(''),
    // debug: z.coerce.number().int().min(0).max(1).optional().default(0),
})
export type UsageQuery = z.infer<typeof UsageQuerySchema>

export const SessionSchema = z.object({
    username: z.string(),
    mac: z.string(),
    ip: z.string(),
    bytes_in: z.number(),
    bytes_out: z.number(),
    groupname: z.string().nullable().optional(),
    nasipaddress: z.string(),
    acctstarttime: z.string().nullable().optional(),
    acctsessiontime: z.number().nullable().optional(),
})
export type Session = z.infer<typeof SessionSchema>

export const LimitsSchema = z.object({
    data_cap_bytes: z.number().nullable(),
    reset_type: z.string().nullable(),
    cap_type: z.string().nullable(),
    mac_counter: z.string().nullable(),
})
export type Limits = z.infer<typeof LimitsSchema>

export const ProfileSchema = z.object({
    id: z.number(),
    name: z.string(),
    created: z.string().nullable().optional(),
    modified: z.string().nullable().optional(),
})
export type Profile = z.infer<typeof ProfileSchema>

export const UsageResponseSchema = z.object({
    status: z.literal('success'),
    params: z.object({ nasipaddress: z.string(), username: z.string().nullable() }),
    data: z.object({
        session: SessionSchema.nullable(),
        profile: ProfileSchema.nullable().optional(),
        profile_id: z.number().nullable().optional(),
        limits: LimitsSchema,
        cake: z
            .object({
                query: z.object({ username: z.string(), mac: z.string() }),
                success: z.boolean(),
                depleted: z.boolean().nullable(),
                data: z.any(),
            })
            .optional(),
        depleted: z.boolean().nullable().optional(),
    }),
})
export type UsageResponse = z.infer<typeof UsageResponseSchema>

// Query schema for the /api/depleted endpoint
export const DepletedQuerySchema = z.object({
    username: z.string().min(1),
    mac: z.string().min(1),
})
export type DepletedQuery = z.infer<typeof DepletedQuerySchema>
