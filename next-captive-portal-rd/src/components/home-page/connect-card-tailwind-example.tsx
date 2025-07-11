// Example: Alternative version of connect-card using Tailwind brand classes
// This demonstrates how you can use the new Tailwind classes instead of inline styles

"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useFormState } from "react-dom";
import Form from "next/form";
import { LoginFormState } from "@/lib/mikrotik/mikrotik-types";
import { useConnect } from "./ConnectContext";
import VideoAd from "@/lib/revive-video-ad";

interface ConnectCardProps {
    backgroundImage?: string;
}

const initialState: LoginFormState = { success: false, message: "" };

export default function ConnectCardTailwind({ backgroundImage }: ConnectCardProps) {
    const { connect, showAd, adUrl, onAdComplete, isDepleted } = useConnect();
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [state, formAction] = useFormState(handleSubmit, initialState);

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
                <VideoAd vastUrl={adUrl} onComplete={onAdComplete} />
            )}
            <div className="relative bg-brand-primary rounded-3xl w-full max-w-md mx-auto">
                {backgroundImage && (
                    <img
                        src={backgroundImage || "/placeholder.svg"}
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
                            Get 1.5 GB of internet free of cost, provided by PluxNet Fibre
                        </h2>
                    </div>

                    <Form action={formAction} className="flex flex-col justify-center items-center">
                        {/* Conditionally Rendered if User's Usage is depleted */}
                        {isDepleted && (
                            <div className="flex items-center justify-between mb-4 gap-4 w-full p-3 bg-surface-white border border-surface-border rounded-lg text-text-primary">
                                <input
                                    type="text"
                                    id="voucherCode"
                                    className="text-base font-normal w-full"
                                    placeholder="Enter voucher code"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="border-white data-[state=checked]:bg-surface-white data-[state=checked]:text-brand-primary mt-0.5"
                            />
                            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                Accept terms & conditions to continue
                            </label>
                        </div>

                        <Button
                            className="w-full bg-button-secondary text-button-secondary-text hover:bg-button-secondary-hover rounded-4xl font-medium py-6 text-base hover:cursor-pointer"
                            type="submit"
                            disabled={state.success}
                        >
                            <img src="watch-video-icon.svg" alt="watch video" width="auth" height="auto" />
                            Watch video to claim
                        </Button>
                    </Form>
                </div>
            </div>
        </>
    );
}
