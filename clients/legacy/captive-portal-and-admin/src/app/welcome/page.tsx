// app/page.tsx
"use client"
import CurrentPlanCard from '@/components/welcome-page/current-plan-card';
import PlanCard from '@/components/welcome-page/plan-card';
import { getHotspotStatus } from '@/lib/mikrotik/mikrotik-service';
import { MikroTikStatus } from '@/lib/mikrotik/mikrotik-types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function WelcomePage() {

    const [status, setStatus] = useState<MikroTikStatus | null>(null);
    // const status = await getHotspotStatus()
    // console.log("Status:", status);

    useEffect(() => {
        getHotspotStatus().then((res) => {
            if (res.success && res.data) {
                console.log("Hotspot Status:", res.data);
                setStatus(res.data);
            } else {
                toast.error(`Failed to fetch hotspot status: ${res.message || "Unknown error"}`);
            }
        });
    }, []);


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
                <section className="p-4 w-full space-y-6">
                    {/* Current Plan */}
                    <div className="flex flex-col items-start justify-start gap-4 w-full">
                        <h4 className="text-lg font-bold text-[#7A7A7A]">Current plan</h4>
                        <CurrentPlanCard bytesIn={status?.bytes_in_nice || ""} bytes_limit={status?.remain_bytes_out || ""} />
                    </div>

                    {/* Available Plans */}
                    <div className="flex flex-col items-start justify-start gap-4 w-full">
                        <h4 className="text-lg font-bold text-[#7A7A7A]">Plans</h4>
                        <div className="flex justify-between items-start gap-4 w-full">
                            <PlanCard />
                            <PlanCard />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
