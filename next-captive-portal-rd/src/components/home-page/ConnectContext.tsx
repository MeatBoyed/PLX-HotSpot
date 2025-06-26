// app/context/ConnectContext.tsx
"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginToHotspot } from "@/lib/mikrotik/mikrotik-service";
import { MikroTikData, LoginFormState } from "@/lib/mikrotik/mikrotik-types";

interface ConnectContextType {
    connect: (mikrotikData: MikroTikData) => Promise<LoginFormState>;
}

const ConnectContext = createContext<ConnectContextType | undefined>(undefined);

export function useConnect() {
    const context = useContext(ConnectContext);
    if (!context) {
        throw new Error("useConnect must be used within ConnectProvider");
    }
    return context;
}

export function ConnectProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const connect = async (mikrotikData: MikroTikData): Promise<LoginFormState> => {
        let result: LoginFormState = { success: false, message: "" };

        await toast.promise(
            loginToHotspot(mikrotikData),
            {
                loading: "Connecting to PluxNet Fibre Hotspot...",
                success: (data) => {
                    if (data.success) {
                        return "Connected to PluxNet Fibre Hotspot";
                    }
                    throw new Error()
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

    return (
        <ConnectContext.Provider value={{ connect }}>
            {children}
        </ConnectContext.Provider>
    );
}
