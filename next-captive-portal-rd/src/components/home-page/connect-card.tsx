"use client";

import React, { useActionState, useState } from "react";
import { Button } from "../ui/button";
// import { useFormState } from "react-dom";
import Form from "next/form";
// import { LoginFormState } from "@/lib/mikrotik/mikrotik-types";
import { useConnect } from "./ConnectContext";
import VideoAd from "@/lib/revive-video-ad";
import { useTheme } from "../theme-provider";
import { PlayCircle } from "lucide-react";

interface ConnectCardProps {
    backgroundImage?: string;
    // mikrotikData?: MikroTikData;
}

export type LoginFormState = { success: boolean, message: string };
const initialState: LoginFormState = { success: false, message: "" };

export default function ConnectCard({ backgroundImage }: ConnectCardProps) {
    const { connect, showAd, onAdComplete, isDepleted } = useConnect();
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [state, formAction] = useActionState(handleSubmit, initialState);
    const { theme } = useTheme();


    async function handleSubmit(): Promise<LoginFormState> {
        if (voucherCode.length > 1) {
            return await connect(voucherCode);
        } else {
            return await connect();
        }
    }

    return (
        <>
            {showAd && (
                <VideoAd vastUrl={theme?.adsVastUrl || ""} onComplete={onAdComplete} />
            )}
            <div className="relative rounded-3xl w-full max-w-md mx-auto" style={{ backgroundColor: theme.brandPrimary }}>
                {(backgroundImage || theme.connectCardBackground) && (
                    <img
                        src={backgroundImage || theme.connectCardBackground || "/placeholder.svg"}
                        alt="Background overlay"
                        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                    />
                )}

                <div className="relative rounded-sm p-4 text-white overflow-hidden">
                    <div className="flex justify-center mb-2">
                        <img src="wifi-icon.svg" alt="wifi icon" width="70px" height="70px" />
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-xl font-bold leading-tight">
                            {theme.heading}
                        </h2>
                    </div>

                    <Form action={formAction} className="flex flex-col justify-center items-center">
                        {/* Conditionally Rendered if User's Usage is depleted */}
                        {isDepleted && (
                            <div className="flex items-center justify-between mb-4 gap-4 w-full p-3 bg-white rounded-lg text-black" style={{ borderColor: 'var(--surface-border)', borderWidth: '1px' }}>
                                <input type="text" id="voucherCode" className="text-base font-normal w-full" placeholder={'Enter voucher code'} value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
                                {/* <button type="button" className="text-base font-semibold text-[#5B3393]" onClick={() => {

                                }} >
                                    Apply
                                </button> */}
                            </div>
                        )}
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="border-white mt-0.5"
                                style={{
                                    '--tw-checked-bg': 'var(--surface-white)',
                                    '--tw-checked-color': 'var(--brand-primary)'
                                } as React.CSSProperties}
                            />
                            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                Accept terms & conditions to continue
                            </label>
                        </div>

                        <Button
                            className="w-full rounded-4xl font-medium py-6 text-base hover:cursor-pointer"
                            style={{
                                backgroundColor: theme.buttonSecondary,
                                color: theme.buttonSecondaryText,
                            }}
                            type="submit"
                            disabled={state.success}
                        >
                            {/* Icon (optional) */}
                            <PlayCircle style={{ width: "32px", height: "32px" }} color={"black"} />
                            Watch video to claim
                        </Button>
                    </Form>
                </div>
            </div>
        </>
    );
}
