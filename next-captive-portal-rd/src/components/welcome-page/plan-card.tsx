import { Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


export default function PlanCard() {

    return (
        <>
            <Card className="w-full" style={{ backgroundColor: 'var(--surface-card)' }}>
                <CardHeader>
                    <CardTitle className="flex flex-col items-start justify-start gap-2">
                        <div className="bg-white border text-sm font-semibold py-[2px] px-[8px] rounded-md" style={{ color: 'var(--text-secondary)' }}>Mini</div>
                        <h5 className="text-[1.5625rem] font-bold" style={{ color: 'var(--text-primary)' }}>R8.00<span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>/month</span></h5>
                    </CardTitle>
                    <CardDescription className="flex flex-col items-start justify-start gap-4 ">
                        <div className="w-full flex items-start justify-start gap-1">
                            <h6 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>50 Hrs</h6>
                            <Dot className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                            <h6 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>2GB</h6>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full rounded-4xl text-white font-medium py-6 text-base"
                        style={{
                            backgroundColor: 'var(--button-primary)',
                            // @ts-ignore: Allow custom CSS variable
                            '--tw-hover-bg': 'var(--button-primary-hover)'
                        } as React.CSSProperties & Record<string, string>}
                    >
                        Select
                    </Button>
                </CardContent>
            </Card >
        </>
    )
}