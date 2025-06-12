"use server"
import { parseMikroTikStatus } from "./mikrotik-lib";
// Must run Client side to use Brower's Fetch/Network to access Mikrotik Hotspot on the network
import { LoginFormState, MikroTikData, StatusResponse, } from "./mikrotik-types";

export async function loginToHotspot(mikrotikData: MikroTikData): Promise<LoginFormState> {
    // Default credentials (No Registration)
    const username = "click_to_connect@dev";
    const password = "click_to_connect";

    // Use provided Mikrotik login link and supply credentials
    const url = `${mikrotikData.loginlink}?${new URLSearchParams({ username, password })}`;

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


export async function getUserSession(mikrotikData: MikroTikData): Promise<StatusResponse> {
    const baseUrl = mikrotikData.link_status ?? "http://10.5.50.1/status";
    const url = new URL(baseUrl);

    // Optional: add cache buster
    url.searchParams.set("_", Date.now().toString());

    try {
        const res = await fetch(url.toString(), { method: "GET" });
        console.log("Response: ", res)
        const rawText = await res.text();

        // console.log("Raw Text res: ", rawText);

        const status = await parseMikroTikStatus(rawText);
        if (!status) return { success: false, message: "Failed to parse status" };

        return { success: true, data: status };
    } catch (err) {
        console.error("Fetch error:", err);
        return { success: false, message: "Request failed" };
    }
}





