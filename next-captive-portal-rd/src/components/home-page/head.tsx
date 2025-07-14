"use client"
import { useTheme } from "../theme-provider";


export default function Head() {
    const { currentTheme } = useTheme();

    return (
        <div className="w-full flex items-center justify-start pt-8 p-4 max-w-md">
            <a href="index.html" className="w-28">
                {/* eslint-disable @next/next/no-img-element  */}
                <img
                    src={currentTheme.images.logo}
                    alt="Brand logo"
                    width="auto"
                    height="auto"
                />
            </a>
        </div>
    )
}