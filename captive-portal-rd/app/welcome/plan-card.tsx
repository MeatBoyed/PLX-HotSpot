import { Dot } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";


export default function PlanCard() {

    return (
        <>
            <Card className="bg-[#F2F2F2] w-full">
                <CardHeader>
                    <CardTitle className="flex flex-col items-start justify-start gap-2">
                        <div className="bg-white border text-[#5D5D5D] text-sm font-semibold py-[2px] px-[8px] rounded-md">Mini</div>
                        <h5 className="text-[1.5625rem] text-[#181818] font-bold">R8.00<span className="text-sm font-medium text-[#7A7A7A]">/month</span></h5>
                    </CardTitle>
                    <CardDescription className="flex flex-col items-start justify-start gap-4 ">
                        <div className="w-full flex items-start justify-start gap-1">
                            <h6 className="text-[#5D5D5D] font-medium text-sm">50 Hrs</h6>
                            <Dot className="text-[#5D5D5D] w-5 h-5" />
                            <h6 className="text-[#5D5D5D] font-medium text-sm">2GB</h6>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full bg-[#5B3393] rounded-4xl hover:bg-[#301358] text-white font-medium py-6 text-base "
                    >
                        Select
                    </Button>
                </CardContent>
            </Card >
        </>
    )
}