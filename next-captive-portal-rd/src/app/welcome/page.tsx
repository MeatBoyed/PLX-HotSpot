// app/page.tsx
"use server"

import UserSession from '@/components/welcome-page/user-session';
import { getMikroTikDataFromCookie } from '@/lib/mikrotik/mikrotik-lib';
import { getUserSession } from '@/lib/mikrotik/mikrotik-service';
import { MikroTikData } from '@/lib/mikrotik/mikrotik-types';
import { redirect } from 'next/navigation';

export default async function WelcomePage() {
    // Get Posted Mikrotik Data
    const mikrotikRaw = await getMikroTikDataFromCookie();
    if (!mikrotikRaw) {
        redirect("/");
    }
    console.log("Raw data: ", mikrotikRaw)


    const userSession = await getUserSession(mikrotikRaw as MikroTikData);
    if (userSession.success && userSession.data) {
        console.log("Hotspot Status:", userSession.data);
    } else {
        redirect("/")
    }

    return (
        <div className="flex flex-col items-center justify-start bg-[#301358]">
            <section className="relative w-full text-white">
                {/* eslint-disable @next/next/no-img-element  */}
                <img
                    src={"banner-overlay.png"}
                    alt="Background overlay"
                    className="absolute inset-0 w-full h-full bg-top-right object-cover bg-no-repeat "
                />
                <div className="strokeWidth">
                    <div className="flex w-full bg-gradient-to-b justify-center items-center">
                        <div className="w-full flex flex-col items-start justify-center pt-8 p-4 max-w-md">
                            <a href="index.html" className="logo d-flex align-items-center">
                                {/*  eslint-disable @next/next/no-img-element  */}
                                <img src="pluxnet-logo-white.svg" alt="PluxNet logo" width="auto" height="auto" />
                            </a>
                            <h3 className="mt-7 font-bold text-2xl">Welcome 👋🏼</h3>
                            <p className="mt-1.5 text-base opacity-70 font-medium">View your connection details below</p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-10 md:items-center md:justify-center max-w-md">
                {mikrotikRaw && (

                    <UserSession status={userSession.data} />
                )}
            </main>
        </div>
    );
}
