"use client"
import { useTheme } from "../theme-provider";

export default function InfoCard() {
    const { currentTheme } = useTheme();

    return (
        <section className="relative w-full text-white">
            {/* eslint-disable @next/next/no-img-element  */}
            <img
                src={currentTheme.images.bannerOverlay || "banner-overlay.png"}
                alt="Background overlay"
                className="absolute inset-0 w-full h-full bg-top-right object-cover bg-no-repeat "
            />
            <div className="strokeWidth">
                <div className="flex w-full bg-gradient-to-b justify-center items-center">
                    <div className="w-full flex flex-col items-start justify-center pt-8 p-4 max-w-md">
                        <a href="index.html" className="logo d-flex align-items-center">
                            {/*  eslint-disable @next/next/no-img-element  */}
                            <img
                                src={currentTheme.images.logoWhite}
                                alt="Brand logo"
                                width="auto"
                                height="auto"
                            />
                        </a>
                        <h3 className="mt-7 font-bold text-2xl">Welcome 👋🏼</h3>
                        <p className="mt-1.5 text-base opacity-70 font-medium">View your connection details below</p>
                    </div>
                </div>
            </div>
        </section>
    )
}