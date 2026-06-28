"use client"
import { PlanCard } from '@/components/plan-card';
import { useTheme } from "@/components/theme-provider";
import AdSection from "@/components/ad-section";
// import VoucherCTA from '@/components/voucher-cta';
import { Navbar } from '@/components/home-page/head';
import VoucherCTA from '@/components/voucher-cta';
import PackagesPlanList from '@/components/packages-plan-list';
import { redirect } from 'next/navigation';


export default function RegisterPage() {
    const { theme } = useTheme()
    if (!theme.authMethods.includes("pu-login")) {
        return redirect("/")
    }
    return (
        <div style={{ background: theme.brandPrimary }} className="flex items-center justify-center flex-col max-w-md w-full" >
            <Navbar />

            {/* Welcome Text */}
            <div className="flex flex-col items-center mt-8 mb-6 w-full">
                <h1 className="text-2xl font-semibold text-center" style={{ color: theme.textPrimary }}>
                    {/* Welcome to Pluxnet <br /> Public WiFi */}
                    {theme.heading}
                </h1>
            </div>

            {/* Main Card Section */}
            <div className="bg-white rounded-t-3xl pt-6 pb-3 px-4 min-h-[50vh] w-full">
                {/* Plans */}
                <h2 className="text-gray-500 text-md font-medium mb-4">
                    Register an account to connect
                </h2>

                <div className="flex justify-center gap-3 overflow-x-auto pb-3">
                    {/* {theme.authMethods.includes("pu-login") && ( */}
                    <PlanCard variant="pu-register" />
                </div>


            </div>
        </div>
    );
}
