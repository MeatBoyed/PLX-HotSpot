"use client"
import { useTheme } from "@/components/theme-provider";
import { env } from "@/env";
import { imageUrl } from "@/lib/image-url";
import Link from "next/dist/client/link";
import React from "react";

export default function SplashPage() {
    const { theme } = useTheme()
    // const [agreed, setAgreed] = useState(false);

    return (
        <div className="relative h-[90vh] overflow-hidden">

            {/* Background image */}
            <div className="fixed inset-0 z-0">
                <img
                    src={imageUrl(theme.splashBackground, theme.ssid)}
                    // src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-pink-400 opacity-80" />
            </div>

            {/* Splash content */}
            <form method="POST" action="/" className="max-w-md w-full flex flex-col justify-center items-center">
                <div className="relative z-10 flex flex-col justify-end h-[90vh] px-6 pb-4">
                    <div className="mb-8">
                        {/* <h1 className="text-white text-4xl font-bold mb-2">PluxNet</h1> */}
                        <div className="text-white text-xl font-semibold">{theme.splashHeading}</div>
                        {/* <div className="text-white text-base">This service is provided by PluxNet</div> */}
                    </div>
                    {/* Terms */}
                    <label className="flex items-start gap-3 mb-6">
                        <span className="mt-1">
                            <input
                                type="checkbox"
                                // checked={agreed}
                                // onChange={() => setAgreed(!agreed)}
                                required
                            />
                        </span>
                        <span className="text-white text-base">
                            Agree with the{" "}
                            <Link href={theme.termsLinks || ""} className={`text-[${theme.brandPrimary}] underline`}>terms and conditions</Link>{" "}
                            related to the processing of data for commercial purposes.
                        </span>
                    </label>
                    {/* Accept button */}
                    <button
                        className={`w-full rounded-full text-white text-lg font-semibold py-4 mb-2 flex items-center justify-center gap-2`}
                        // disabled={!agreed}
                        style={{
                            backgroundColor: theme.buttonPrimary,
                            color: theme.buttonPrimaryText,
                        }}
                        type="submit"
                    >
                        Accept &amp; continue <span className="text-2xl">&rarr;</span>
                        {/* <Link href={agreed ? "/" : "#"} >
                        Accept &amp; continue <span className="text-2xl">&rarr;</span>
                    </Link> */}
                    </button>
                </div>
            </form>

            {/* Powered by
            <div className="text-center mb-3 mt-2 text-gray-300 text-xs relative z-20">
                Powered by <span className="font-bold text-[#F55C7A]">N</span> <span className="font-semibold text-white">PluxNet</span>
            </div> */}
        </div>
    );
}