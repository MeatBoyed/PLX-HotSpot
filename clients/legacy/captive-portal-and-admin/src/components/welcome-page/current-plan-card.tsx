import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/config";


export default function CurrentPlanCard({ bytesIn, bytes_limit }: { bytesIn: string, bytes_limit: string }) {
    return (
        <Card className="w-full" style={{ backgroundColor: 'var(--surface-card)' }}>
            <CardHeader>
                <CardTitle className="font-bold text-2xl">
                    {appConfig.messages.currentPlanTitle}
                </CardTitle>
                {/* <CardTitle className="text-[#F60031] font-bold text-2xl">
                    You&apos;re out of internet!
                </CardTitle> */}
                <CardDescription className="flex flex-col items-start justify-start gap-4 border-b pb-4">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>
                        For uninterrupted internet usage, use your voucher code below or select a top up plan.
                    </p>
                    <div className="flex  items-center gap-20">
                        <div className="space-y-1.5">
                            <h3 className="text-sm font-medium text-[#5D5D5D]">Plan</h3>
                            <h5 className="font-bold text-base text-[#181818]">Free plan</h5>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-sm font-medium text-[#5D5D5D]">Data used</h3>
                            <h5 className="font-bold text-base text-[#181818]">{bytesIn} / <span className="text-base font-medium text-[#5D5D5D]">{bytes_limit === "" ? "Unlimited" : bytes_limit}</span></h5>
                        </div>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full flex flex-col items-start justify-start gap-4">
                    <h5 className="font-bold text-base text-[#181818]">Apply voucher</h5>
                    <div className="flex items-center justify-between gap-4 w-full p-3 bg-white border border-[#CECECE] rounded-lg">
                        <input type="text" id="voucherCode" className="text-base font-normal w-full" placeholder="Enter voucher code" />
                        <button type="button" className="text-base font-semibold text-[#5B3393]" >
                            Apply
                        </button>
                    </div>
                    {/* <div id="error-msg" className="errror-msg">This voucher is expired</div> */}
                </div>
            </CardContent>
        </Card >
    )
}