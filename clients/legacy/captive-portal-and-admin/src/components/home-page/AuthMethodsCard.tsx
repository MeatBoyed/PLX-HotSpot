import { PlanCard } from "../plan-card"
import { useTheme } from "../theme-provider"
import VoucherCTA from "../voucher-cta"


export default function AuthMethodsCard() {
    const { theme } = useTheme()

    return (

        <div className="flex flex-col gap-3">
            {theme.authMethods.includes("free") && (
                <div
                    className="rounded-2xl overflow-hidden shadow-lg"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                    }}
                >
                    <PlanCard variant="free" totalData='24 Hrs • 1.5 GB' tag='Promotion' />
                </div>
            )}
            {theme.authMethods.includes("voucher") && (
                <div
                    className="rounded-2xl overflow-hidden shadow-lg"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                    }}
                >
                    <VoucherCTA />
                </div>
            )}
            {theme.authMethods.includes("pu-login") && (
                <div
                    className="rounded-2xl overflow-hidden shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
                >
                    <PlanCard variant="pu-login" />
                </div>
            )}
            {theme.authMethods.includes("pu-phonename") && (
                <div
                    className="rounded-2xl overflow-hidden shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
                >
                    <PlanCard variant="pu-phonename" />
                </div>
            )}
        </div>
    )
}