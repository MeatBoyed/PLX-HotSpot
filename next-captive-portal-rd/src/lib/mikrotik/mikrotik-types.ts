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
