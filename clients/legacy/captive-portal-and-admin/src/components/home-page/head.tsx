"use client"
import Link from "next/link";
import { useTheme } from "../theme-provider";
import { imageUrl } from "@/lib/image-url";



export default function Head() {
    const { theme } = useTheme();
    console.log("ThemeProvider theme: ", theme)

    return (
        <div className="w-full flex items-center justify-start pt-8 p-4 max-w-md">
            <a href="index.html" className="w-28">
                {/* eslint-disable @next/next/no-img-element  */}
                <img
                    src={imageUrl(theme.logo, theme.ssid)}
                    alt="Brand logo"
                    width="auto"
                    height="auto"
                />
            </a>
        </div>
    )
}

export function Navbar() {
    const { theme } = useTheme();
    return (
        <div className="flex items-center justify-between px-5 pt-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* <div className="bg-[#F55C7A] rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-white font-bold">N</span>
                </div>
                <span className="text-white text-lg font-semibold">PluxNet</span> */}
                <Link href="/">
                    <img
                        // src={`${env.NEXT_PUBLIC_HOTSPOT_API_BASE_URL}/${theme.ssid}${theme.logo}`}
                        src={imageUrl(theme.logo, theme.ssid)}
                        alt="Brand logo"
                        width="auto"
                        height="auto"
                    />
                </Link>
            </div>
            {/* <button className="border border-white rounded-full px-4 py-1 text-white text-sm">Connect Now</button> */}
            {/* Profile Icon */}
            {/* <div className="w-8 h-8 border-white border rounded-full flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2" />
                    <path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" stroke="#fff" strokeWidth="2" fill="none" />
                </svg>
            </div> */}
        </div>
    )
}