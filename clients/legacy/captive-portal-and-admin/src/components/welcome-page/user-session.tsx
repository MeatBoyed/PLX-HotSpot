"use client"

// import { MikroTikStatus, RadiusDeskUsageResponse } from "@/lib/mikrotik/mikrotik-types";
import PlanCard from "./plan-card";

// Configuration
// const POLLING_INTERVAL_MS = 60000; // 60 seconds - easy to change

// interface UserSessionProps {
//     status: MikroTikStatus;
//     userUsage?: RadiusDeskUsageResponse | null;
// }

// export default function UserSession({ status: initialStatus, userUsage: initialUsage }: UserSessionProps) {
export default function UserSession() {
    // const { status, userUsage } = useStatusPolling({
    //     initialStatus,
    //     initialUsage,
    //     pollingIntervalMs: POLLING_INTERVAL_MS,
    //     enabled: true
    // });

    return (
        <section className="p-4 w-full space-y-6">
            {/* Current Plan */}
            <div className="flex flex-col items-start justify-start gap-4 w-full">
                <h4 className="text-lg font-bold" style={{ color: 'var(--text-tertiary)' }}>Current plan</h4>
                {/* <CurrentPlanCard
                    bytesIn={status?.bytes_out_nice || ""}
                    bytes_limit={userUsage?.data?.data_cap ? `${(userUsage.data.data_cap / (1024 * 1024)).toFixed(1)} MB` : "Unknown"}
                /> */}
            </div>

            {/* Available Plans */}
            <div className="flex flex-col items-start justify-start gap-4 w-full">
                <h4 className="text-lg font-bold" style={{ color: 'var(--text-tertiary)' }}>Plans</h4>
                <div className="flex justify-between items-start gap-4 w-full">
                    <PlanCard />
                    <PlanCard />
                </div>
            </div>
        </section>
    );
}