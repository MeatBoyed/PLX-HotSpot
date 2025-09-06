"use client";
import { useTheme } from "@/components/theme-provider";
import { PlanCard } from '@/components/plan-card';
import VoucherCTA from '@/components/voucher-cta';
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
        <div style={{ background: theme.brandPrimary }}>
            {/* Top Bar */}
            <Navbar />

            {/* Welcome Text */}
            <div className="flex flex-col items-center mt-8 mb-2">
                <h1 className="text-white text-2xl font-semibold text-center">
                    Welcome back, Henry <span className="inline-block">👋</span>
                </h1>
                <span className="text-gray-200 text-base mt-1">
                    View your connection details below
                </span>
            </div>

            {/* Main Card Section */}
            <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[70vh]">
                {/* Current Plan */}
                <h2 className="text-gray-500 text-lg font-medium mb-2">Current plan</h2>
                <div className="bg-gray-100 rounded-xl p-4 flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-base">Free plan</span>
                        <span className="font-semibold text-gray-700">$0.00</span>
                    </div>
                    <div className="text-2xl font-bold text-black">
                        1.41 <span className="text-[#6F36C1] font-bold">GB</span>
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
                <div className="flex gap-3 overflow-x-auto pb-3">

                    <PlanCard price='Free' total_data='24 Hrs • 1.5 GB' tag='Promotion' />
                    <PlanCard price='$8.00' total_data='50 Hrs • 2GB' tag='Mini' />
                </div>

                {/* Voucher Section */}
                <VoucherCTA />

                {/* Banner */}
                <AdSection />

                {/* Usage Section */}
                <h2 className="text-gray-500 text-lg font-medium mb-2">Usage</h2>
                <div className="flex flex-col items-center">
                    <div className="w-full relative">
                        {/* Simple usage chart - replace with chart lib if needed */}
                        <svg width="100%" height="170" viewBox="0 0 340 170" className="mb-2">
                            <defs>
                                <linearGradient id="usageGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#6F36C1" />
                                    <stop offset="100%" stopColor="#fff" />
                                </linearGradient>
                            </defs>
                            {/* Example usage curve */}
                            <polyline
                                fill="url(#usageGradient)"
                                stroke="#6F36C1"
                                strokeWidth="3"
                                points="0,160 30,150 60,130 90,140 120,120 150,150 180,110 210,130 240,90 270,100 300,70 340,160"
                            />
                            {/* Axis lines */}
                            <line x1="40" y1="10" x2="40" y2="160" stroke="#eee" strokeWidth="2" />
                            <line x1="40" y1="160" x2="340" y2="160" stroke="#eee" strokeWidth="2" />
                            {/* Tooltip simulation */}
                            <rect x="110" y="40" width="120" height="35" rx="8" fill="#222" opacity="0.9" />
                            <text x="120" y="60" fill="#fff" fontSize="12">04 Apr, 2025 - 12:00 am</text>
                            <text x="120" y="75" fill="#fff" fontSize="14" fontWeight="bold">167.24 MB</text>
                        </svg>
                        {/* Y-axis labels (left) */}
                        <div className="absolute left-0 top-3 text-xs text-gray-400 space-y-9">
                            <div>500MB</div>
                            <div>400MB</div>
                            <div>300MB</div>
                            <div>200MB</div>
                            <div>100MB</div>
                            <div>0</div>
                        </div>
                    </div>
                    {/* Usage filter buttons */}
                    <div className="flex gap-2 justify-center mt-2 mb-1">
                        <button className="px-4 py-1 rounded-full bg-black text-white text-xs font-semibold">1 Day</button>
                        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">1 Week</button>
                        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">1 Month</button>
                        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">All</button>
                    </div>
                    {/* Dots for slider */}
                    <div className="flex justify-center mb-2">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full inline-block" />
                            <span className="w-2 h-2 bg-gray-200 rounded-full inline-block" />
                            <span className="w-2 h-2 bg-gray-200 rounded-full inline-block" />
                        </div>
                    </div>
                </div>
            </div>

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
