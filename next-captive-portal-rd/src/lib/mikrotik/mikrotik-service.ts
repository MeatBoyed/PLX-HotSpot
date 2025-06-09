// app/lib/mikrotik/login.ts
"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MikroTikData, MikroTikDataSchema } from "./mikrotik-types";

type LoginParams = {
    username: string;
    password: string;
    host?: string;
}

// export async function loginToHotspot(): Promise<{ success: boolean; response: string }> {
export async function loginToHotspot() {
    const username = "click_to_connect@dev"
    const password = "click_to_connect"
    const host = "10.5.50.1"

    const mikrotikRaw = await getMikroTikDataFromCookie();
    if (!mikrotikRaw) {
        console.error("No MikroTik data found in cookies");
        return redirect('/error?message=No MikroTik data found');
    }
    console.log("Raw data: ", mikrotikRaw)

    const query = new URLSearchParams({
        username,
        password,
    });
    // const url = `http://${host}/login?${query.toString()}`;
    const url = `${mikrotikRaw.loginlink}?${query.toString()}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
        });

        const text = await res.text();

        const success = res.ok && /already|logged/i.test(text);
        console.log(`Success: ${success}, Response: ${text}`);
        // return { success, response: text };
    } catch (err) {
        console.error('MikroTik login error:', err);
        console.log(`Success: false, Response: ${(err as Error).message}`);
        // return { success: false, response: (err as Error).message };
    }

        redirect('/welcome');
}

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
