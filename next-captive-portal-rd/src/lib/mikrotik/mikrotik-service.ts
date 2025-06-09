// app/lib/mikrotik/login.ts
"use server"

import { cookies } from "next/headers";
import { MikroTikData, MikroTikDataSchema } from "./mikrotik-types";

type LoginFormState = {
    success: boolean;
    message?: string;
};

export async function loginToHotspot(_: any, formData: FormData): Promise<LoginFormState> {
    // Default credentials (No Registration)
    const username = "click_to_connect@dev";
    const password = "click_to_connect";

    // Get Session data provided by Mikrotik Hotspot
    const mikrotikRaw = await getMikroTikDataFromCookie();
    if (!mikrotikRaw) {
        return { success: false, message: "Hotspot data missing or invalid. Please try again. TODO: Block rendering if no data is passed/found" };
    }

    // Use provided Mikrotik login link and supply credentials
    const url = `${mikrotikRaw.loginlink}?${new URLSearchParams({ username, password })}`;

    try {
        const res = await fetch(url, { method: "GET", redirect: "follow" });
        const text = await res.text();
        const success = res.ok && /already|logged/i.test(text);

        if (!success) {
            return { success: false, message: "Login failed. Please try again." };
        }

        return { success: true };
    } catch (err) {
        // console.error("Login error:", err);
        const message = (err as Error).message || "An error occurred during login.";
        return { success: false, message: message };
    }
}

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
