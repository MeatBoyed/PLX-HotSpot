"use client"
import { useTheme } from "@/components/theme-provider";
import Link from "next/link";
import React, { useState } from "react";

export default function SplashPage() {
    const { theme } = useTheme()
    const [agreed, setAgreed] = useState(true);

    return (
        <div className="relative h-[90vh] overflow-hidden">

            {/* Background image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-pink-400 opacity-80" />
            </div>

            {/* Splash content */}
            <div className="relative z-10 flex flex-col justify-end h-[90vh] px-6 pb-4">
                <div className="mb-8">
                    <h1 className="text-white text-4xl font-bold mb-2">PluxNet</h1>
                    <div className="text-white text-xl font-semibold">Public hotspot</div>
                    <div className="text-white text-base">This service is provided by PluxNet</div>
                </div>
                {/* Terms */}
                <label className="flex items-start gap-3 mb-6">
                    <span className="mt-1">
                        <span className={`w-6 h-6 rounded bg-[${theme.brandPrimary}] flex items-center justify-center`}>
                            {agreed && (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="2" fill="none" />
                                </svg>
                            )}
                        </span>
                    </span>
                    <span className="text-white text-base">
                        Agree with the{" "}
                        <a href="#" className={`text-[${theme.brandPrimary}] underline`}>terms and conditions</a>{" "}
                        related to the processing of data for commercial purposes.
                    </span>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={() => setAgreed(!agreed)}
                        className="hidden"
                    />
                </label>
                {/* Accept button */}
                <button
                    className={`w-full rounded-full text-white text-lg font-semibold py-4 mb-2 flex items-center justify-center gap-2`}
                    disabled={!agreed}
                    style={{
                        backgroundColor: theme.buttonPrimary,
                        color: theme.buttonPrimaryText,
                    }}
                >
                    <Link href={agreed ? "/" : "#"} >
                        Accept &amp; continue <span className="text-2xl">&rarr;</span>
                    </Link>
                </button>
            </div>

            {/* Powered by
            <div className="text-center mb-3 mt-2 text-gray-300 text-xs relative z-20">
                Powered by <span className="font-bold text-[#F55C7A]">N</span> <span className="font-semibold text-white">PluxNet</span>
            </div> */}
        </div>
    );
}