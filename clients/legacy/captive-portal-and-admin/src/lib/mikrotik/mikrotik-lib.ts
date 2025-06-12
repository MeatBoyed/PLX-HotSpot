// Must be Server Side to access Cookies
"use server";
import { cookies } from "next/headers";
import { MikroTikData, MikroTikDataSchema, MikroTikStatus, MikroTikStatusSchema } from "./mikrotik-types";

// Handles retrieving Mikrotik data from cookie, validating, typing and returning it
export async function getMikroTikDataFromCookie(): Promise<MikroTikData | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get("mikrotik-data")?.value;

    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        const result = MikroTikDataSchema.safeParse(parsed);

        if (!result.success) {
            console.error("Invalid MikroTik cookie data:", result.error.flatten());
            return null;
        }

        return result.data;
    } catch (err) {
        console.error("Failed to parse MikroTik cookie:", err);
        return null;
    }
}


export async function parseMikroTikStatus(rawText: string): Promise<MikroTikStatus | null> {
    try {
        const trimmed = rawText.trim();

        // Remove surrounding parentheses
        const jsonLike = trimmed.replace(/^\(\s*|\s*\)$/g, "");

        // Replace single quotes with double quotes
        const cleaned = jsonLike.replace(/'/g, '"');

        const parsed = JSON.parse(cleaned);
        const result = MikroTikStatusSchema.safeParse(parsed);

        if (!result.success) {
            console.error("Validation failed:", result.error.flatten());
            return null;
        }

        return result.data;
    } catch (err) {
        console.error("Failed to parse MikroTik status:", err);
        return null;
    }
}