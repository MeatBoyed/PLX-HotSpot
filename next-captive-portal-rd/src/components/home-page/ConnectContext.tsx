"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginToHotspot } from "@/lib/mikrotik/mikrotik-service";
import { MikroTikData, LoginFormState } from "@/lib/mikrotik/mikrotik-types";

interface ConnectContextType {
    connect: (mikrotikData: MikroTikData) => Promise<LoginFormState>;
    showAd: boolean;
    adUrl: string;
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

export function ConnectProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [showAd, setShowAd] = useState(false);
    const [pendingLoginData, setPendingLoginData] = useState<MikroTikData | null>(null);

    const adUrl = "https://servedby.revive-adserver.net/fc.php?script=apVideo:vast2&zoneid=24615";

    const connect = async (mikrotikData: MikroTikData): Promise<LoginFormState> => {
        const isFirstLogin = true; // Replace with logic later

        if (isFirstLogin) {
            setPendingLoginData(mikrotikData);
            setShowAd(true);
            return { success: false, message: "Waiting for ad to complete" };
        }

        return await doLogin(mikrotikData);
    };

    const doLogin = async (mikrotikData: MikroTikData): Promise<LoginFormState> => {
        let result: LoginFormState = { success: false, message: "" };

        await toast.promise(
            loginToHotspot(mikrotikData),
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

        if (result.success) {
            router.push("/welcome");
        }

        return result;
    };

    const onAdComplete = async () => {
        setShowAd(false);
        if (pendingLoginData) {
            await doLogin(pendingLoginData);
            setPendingLoginData(null);
        }
    };

    return (
        <ConnectContext.Provider value={{ connect, showAd, adUrl, onAdComplete }}>
            {children}
        </ConnectContext.Provider>
    );
}
