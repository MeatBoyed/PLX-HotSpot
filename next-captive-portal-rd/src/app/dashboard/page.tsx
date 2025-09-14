"use client";
import { useTheme } from "@/components/theme-provider";
import { PlanCard } from '@/components/plan-card';
// Must run on Server otherwise RadiusDesk requests fails
// import UserSession from '@/components/welcome-page/user-session';
// import InfoCard from '@/components/welcome-page/info-card';

// export default function DashboardPage() {

//     return (
//         <div className="w-full flex flex-col">
//             <div className="flex flex-col items-center justify-start" >
//                 <InfoCard />

//                 <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-10 md:items-center md:justify-center max-w-md">
//                     {/* {authState.userSession && ( */}
//                     <UserSession
//                     // status={authState.userSession}
//                     // userUsage={authState.userUsage}
//                     />
//                     {/* )} */}
//                 </main>
//             </div>
//         </div>
//     );
// }

import React from "react";
import AdSection from "@/components/ad-section";
import { Navbar } from "@/components/home-page/head";

export default function Dashboard() {
    const { theme } = useTheme()
    return (
        <div style={{ background: theme.brandPrimary }} className="flex flex-col items-center justify-center max-w-md w-full">
            {/* Top Bar */}
            <Navbar />

            {/* Welcome Text */}
            <div className="flex flex-col items-center mt-8 mb-2 w-full">
                <h1 className="text-white text-2xl font-semibold text-center">
                    Welcome back, Henry <span className="inline-block">👋</span>
                </h1>
                <span className="text-gray-200 text-base mt-1">
                    View your connection details below
                </span>
            </div>

            {/* Main Card Section */}
            <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[70vh] w-full mt-5">
                {/* Current Plan */}
                <h2 className="text-gray-500 text-lg font-medium mb-2">Current plan</h2>
                <div className="bg-gray-100 rounded-xl p-4 flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-base">Free plan</span>
                        <span className="font-semibold text-gray-700">$0.00</span>
                    </div>
                    <div className="text-2xl font-bold text-black">
                        1.41 <span className=" font-bold">GB</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                        left of 2.0 GB
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-2">
                        <div className={`h-2 bg-[${theme.brandPrimary}] rounded-full`} style={{ width: "70%" }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>
                            Expires on <br /><span className="font-medium text-black">4th Apr, 2025</span>
                        </span>
                        <span>
                            Speed <br /><span className="font-medium text-black">10 Mbps</span>
                        </span>
                    </div>
                </div>

                {/* Change Plan */}
                <h2 className="text-gray-500 text-lg font-medium mb-2">Change your plan</h2>
                <div className="flex gap-3 overflow-x-auto pb-3 items-center">
                    <PlanCard price='Free' total_data='24 Hrs • 1.5 GB' tag='Promotion' />
                </div>

                {/* Voucher Section */}
                {/* <VoucherCTA /> */}

            </div>
            <AdSection />

            {/* Bottom Nav */}
            {/* <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-between px-6 py-2">
                <div className="flex flex-col items-center text-[#6F36C1]">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3l9.5 8.5-1.42 1.42L12 5.84l-8.08 7.08L2.5 11.5z" fill="currentColor" /></svg>
                    <span className="text-xs">Home</span>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /></svg>
                    <span className="text-xs">Weather</span>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor" /><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" /></svg>
                    <span className="text-xs">Around me</span>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" /></svg>
                    <span className="text-xs">More</span>
                </div>
            </nav> */}
        </div>
    );
}
