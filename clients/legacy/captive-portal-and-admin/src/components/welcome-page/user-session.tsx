"use client"

import { MikroTikStatus } from "@/lib/mikrotik/mikrotik-types";
import CurrentPlanCard from "./current-plan-card";
import PlanCard from "./plan-card";

export default function UserSession({ status }: { status: MikroTikStatus }) {
    // const [status, setStatus] = useState<MikroTikStatus | null>(null);

    // useEffect(() => {
    //     getUserSession(mikrotikData).then((res) => {
    //         if (res.success && res.data) {
    //             console.log("Hotspot Status:", res.data);
    //             setStatus(res.data);
    //         } else {
    //             toast.error(`Failed to fetch hotspot status: ${res.message || "Unknown error"}`);
    //         }
    //     });
    // }, []);

    return (
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

    )
}