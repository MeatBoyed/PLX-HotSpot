"use client";

import { Button } from "../ui/button";
import { useFormState } from "react-dom";
import Form from "next/form";
import { LoginFormState } from "@/lib/mikrotik/mikrotik-types";
import { useConnect } from "./ConnectContext";
import VideoAd from "@/lib/revive-video-ad";
import { useState } from "react";

interface ConnectCardProps {
    backgroundImage?: string;
    // mikrotikData: MikroTikData;
}

const initialState: LoginFormState = { success: false, message: "" };

export default function ConnectCard({ backgroundImage }: ConnectCardProps) {
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
            <div className="relative bg-[#301358] rounded-3xl w-full max-w-md mx-auto">
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
                            <div className="flex items-center justify-between mb-4 gap-4 w-full p-3 bg-white border border-[#CECECE] rounded-lg text-black">
                                <input type="text" id="voucherCode" className="text-base font-normal w-full" placeholder="Enter voucher code" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
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
                                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
                            />
                            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                                Accept terms & conditions to continue
                            </label>
                        </div>

                        <Button
                            className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base hover:cursor-pointer"
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
