// schemas/mikrotik.ts
import { z } from "zod";

export const MikroTikDataSchema = z.object({
    loginlink: z.string().url(),
    nasid: z.string(),
    link_status: z.string().url(),
    link_login_only: z.string().url(),
    link_logout: z.string().url(),
    mac: z.string(), // If needed, you can add regex validation for MAC format.
    type: z.literal("mikrotik"),
    ssid: z.string(),
});

export type MikroTikData = z.infer<typeof MikroTikDataSchema>;

export const MikroTikStatusSchema = z.object({
    logged_in: z.string(),
    username: z.string(),
    ip: z.string(),
    mac: z.string(),
    bytes_in: z.string(),
    bytes_out: z.string(),
    bytes_in_nice: z.string(),
    bytes_out_nice: z.string(),
    packets_in: z.string(),
    packets_out: z.string(),
    uptime: z.string(),
    session_time_left: z.string().optional(),
    remain_bytes_in: z.string().optional(),
    remain_bytes_out: z.string().optional(),
    link_login_only: z.string().url(),
    link_logout: z.string().url(),
});

export type MikroTikStatus = z.infer<typeof MikroTikStatusSchema>;

export type LoginFormState = {
    success: boolean;
    message?: string;
};
export type StatusResponse = {
    success: boolean;
    data?: MikroTikStatus;
    message?: string;
};

// types/radiusdesk.ts
export interface RadiusDeskUsageResponse {
    success: boolean;
    data?: {
        data_used: number | null;
        data_cap: number | null;
        time_used: number | null;
        time_cap: number | null;
        depleted: boolean;
    };
    message?: string;
}
