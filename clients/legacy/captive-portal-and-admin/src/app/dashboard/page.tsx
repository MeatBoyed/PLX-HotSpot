"use client";
import { useTheme } from "@/components/theme-provider";
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
import PackagesPlanList from "@/components/packages-plan-list";

export default function Dashboard() {
    const { theme } = useTheme()
    return (
        <div style={{ background: theme.brandPrimary }} className="flex flex-col items-center justify-center max-w-md w-full">
            {/* Top Bar */}
            <Navbar />

            {/* Welcome Text */}
            <div className="flex flex-col items-center mt-8 mb-2 w-full">
                <h1 className="text-white text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}>
                    Welcome back <span className="inline-block">👋</span>
                </h1>
                <span className=" text-base mt-1" style={{ color: theme.textTertiary }}>
                    View your connection details below
                </span>
            </div>

            {/* Main Card Section */}
            <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[50vh] w-full mt-5">
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
                        <div className="h-2 rounded-full" style={{ width: "70%", backgroundColor: theme.brandPrimary }} />
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
                {/* <div className="flex gap-3 overflow-x-auto pb-3 items-center"> */}
                {/* <PlanCard variant="free" totalData='24 Hrs • 1.5 GB' tag='Promotion' /> */}
                {/* <PlanCard variant="paid" price='R50' totalData='50 Hrs • 2GB' tag='Mini' />
                    <PlanCard variant="paid" price='R100' totalData='100 Hrs • 100GB' tag='Mega' />
                </div> */}
                <PackagesPlanList ssid={theme.ssid} />

                {/* Voucher Section */}
                {/* <VoucherCTA /> */}

                <AdSection />
            </div>


        </div>
    );
}
