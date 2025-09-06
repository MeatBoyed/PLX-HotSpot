"use client"

import { usePathname } from "next/navigation";

export default function Footer() {
    let defaultSrc = "/branding-footer-dark.png"
    const pathname = usePathname()
    if (pathname.includes("splash")) defaultSrc = "/branding-footer-light.png"

    return (
        <footer className="w-full py-4 flex flex-row items-center justify-center gap-3 text-center ">
            {/* <span className="text-[10px] uppercase tracking-wide text-gray-500">Powered By</span> */}
            <img
                src={defaultSrc}
                alt="Powered by PluxNet Fibre"
                className="h-5 w-auto opacity-80"
                draggable={false}
            />
        </footer>
    );
}