// app/lib/mikrotik/login.ts
"use server"

import { cookies } from "next/headers";
import { MikroTikData, MikroTikDataSchema, MikroTikStatus, MikroTikStatusSchema } from "./mikrotik-types";
import { getMikroTikDataFromCookie, parseMikroTikStatus } from "./mikrotik-lib";

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


type StatusResponse = {
    success: boolean;
    data?: MikroTikStatus;
    message?: string;
};

export async function getHotspotStatus(): Promise<StatusResponse> {
    const cookieStore = await cookies();
    const raw = cookieStore.get("mikrotik-data")?.value;

    if (!raw) return { success: false, message: "No Session data found" };

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { success: false, message: "Invalid cookie format" };
    }

    const validated = MikroTikDataSchema.safeParse(parsed);
    if (!validated.success) {
        return { success: false, message: "Invalid session structure" };
    }

    const baseUrl = validated.data.link_status ?? "http://10.5.50.1/status";
    const url = new URL(baseUrl);

    // Optional: add cache buster
    url.searchParams.set("_", Date.now().toString());

    try {
        const res = await fetch(url.toString(), { method: "GET" });
        const rawText = await res.text();


        console.log("Raw Text res: ", rawText);

        const status = parseMikroTikStatus(rawText);
        if (!status) return { success: false, message: "Failed to parse status" };

        return { success: true, data: status };
    } catch (err) {
        console.error("Fetch error:", err);
        return { success: false, message: "Request failed" };
    }
}


