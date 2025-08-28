"use client"
import { Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";


export default function PlanCard() {
    const { theme } = useTheme()
    return (
        <Card className="w-full" style={{ backgroundColor: theme.colors.surfaceCard }}>
            <CardHeader>
                <CardTitle className="flex flex-col items-start justify-start gap-2">
                    <div className="bg-white border text-sm font-semibold py-[2px] px-[8px] rounded-md" style={{ color: 'var(--text-secondary)' }}>Mini</div>
                    <h5 className="text-[1.5625rem] font-bold" style={{ color: theme.colors.textPrimary }}>
                        R8.00<span className="text-sm font-medium" style={{ color: theme.colors.textTertiary }}>/month</span>
                    </h5>
                </CardTitle>
                <CardDescription className="flex flex-col items-start justify-start gap-4 ">
                    <div className="w-full flex items-start justify-start gap-1">
                        <h6 className="font-medium text-sm" style={{ color: theme.colors.textSecondary }}>50 Hrs</h6>
                        <Dot className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        <h6 className="font-medium text-sm" style={{ color: theme.colors.textSecondary }}>2GB</h6>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    className="w-full rounded-4xl text-white font-medium py-6 text-base"
                    style={{
                        backgroundColor: theme.colors.brandPrimary,
                        '--tw-hover-bg': theme.colors.brandPrimaryHover
                    } as React.CSSProperties & Record<string, string>}
                >
                    Select
                </Button>
            </CardContent>
        </Card >
    )
}