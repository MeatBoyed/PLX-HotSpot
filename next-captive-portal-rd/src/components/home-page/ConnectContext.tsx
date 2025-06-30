"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkUserUsage, loginToHotspot } from "@/lib/mikrotik/mikrotik-service";
import { MikroTikData, LoginFormState, RadiusDeskUsageResponse } from "@/lib/mikrotik/mikrotik-types";

interface ConnectContextType {
    connect: (voucherCode?: string) => Promise<LoginFormState>;
    showAd: boolean;
    adUrl: string;
    isDepleted?: boolean;
    onAdComplete: () => void;
}

const ConnectContext = createContext<ConnectContextType | undefined>(undefined);

export function useConnect() {
    const context = useContext(ConnectContext);
    if (!context) {
        throw new Error("useConnect must be used within ConnectProvider");
    }
    return context;
}

export function ConnectProvider({ children, mikrotikData, userUsage }: { children: ReactNode, mikrotikData: MikroTikData, userUsage?: RadiusDeskUsageResponse }) {
    const router = useRouter();
    const [showAd, setShowAd] = useState(false);
    const [voucherCode, setVoucherCode] = useState<string | undefined>(undefined);
    const [pendingLoginData, setPendingLoginData] = useState<MikroTikData | null>(mikrotikData);

    const isDepleted = userUsage?.data?.depleted || false;
    const adUrl = "https://servedby.revive-adserver.net/fc.php?script=apVideo:vast2&zoneid=24615";

    // Main Connect method - This method will handle the login process and show the ad if it's the first login
    const connect = async (voucherCode?: string): Promise<LoginFormState> => {
        setVoucherCode(voucherCode);

        // IsDepleted False: User hasn't used up Free data (Show Ad), True: User has used up Free data (Don't Show Ad)
        if (!isDepleted) {
            // setPendingLoginData(mikrotikData);
            setShowAd(true);
            return { success: false, message: "Waiting for ad to complete" };
        }

        return await doLogin(mikrotikData);
    };

    // Main Login method - Authenticates with Mikrotik and handles the response
    const doLogin = async (mikrotikData: MikroTikData): Promise<LoginFormState> => {
        let result: LoginFormState = { success: false, message: "" };

        await toast.promise(
            loginToHotspot(mikrotikData, voucherCode),
            {
                loading: "Connecting to PluxNet Fibre Hotspot...",
                success: (data) => {
                    if (!data.success) throw new Error()
                    return "Connected to PluxNet Fibre Hotspot";
                },
                error: (error) => {
                    result = error;
                    return "Oops! Something went wrong. Please try again.";
                },
            }
        );

        console.log("Login Result: ", result);
        if (result.success) {
            router.push("/welcome");
        }

        return result;
    };

    // Callback for when the Ad completes playing
    const onAdComplete = async () => {
        setShowAd(false);
        if (pendingLoginData) {
            await doLogin(pendingLoginData);
            setPendingLoginData(null);
        }
    };

    return (
        <ConnectContext.Provider value={{ connect, showAd, adUrl, onAdComplete, isDepleted }}>
            {children}
        </ConnectContext.Provider>
    );
}
