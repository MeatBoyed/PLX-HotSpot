import Link from 'next/link';
import { Phone, CreditCard, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export default function HowItWorks() {
    const { theme } = useTheme()

    return (
        <section className="rounded border p-4 bg-white/50 text-sm">
            <h3 className="text-base font-semibold">How it works</h3>

            <div className="mt-4 grid grid-rows-3 gap-5">
                <div className="flex items-start gap-3">
                    <div style={{ background: theme.brandPrimary }} className="flex-shrink-0 w-10 h-10 rounded-full  text-primary-foreground flex items-center justify-center">
                        <Phone color={theme.brandSecondary} size={18} />
                    </div>
                    <div>
                        <p className="font-medium">1. Enter phone number</p>
                        <p className="text-muted-foreground">Provide the mobile number to receive the voucher via SMS.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div style={{ background: theme.brandPrimary }} className="flex-shrink-0 w-10 h-10 rounded-full text-primary-foreground flex items-center justify-center">
                        <CreditCard color={theme.brandSecondary} size={18} />
                    </div>
                    <div>
                        <p className="font-medium">2. Pay securely</p>
                        <p className="text-muted-foreground">Complete the payment using <Link href="https://payfast.io/" className="text-primary underline">PayFast</Link> — secure and quick.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div style={{ background: theme.brandPrimary }} className="flex-shrink-0 w-10 h-10 rounded-full text-primary-foreground flex items-center justify-center">
                        <CheckCircle color={theme.brandSecondary} size={18} />
                    </div>
                    <div>
                        <p className="font-medium">3. Connect</p>
                        <p className="text-muted-foreground">Copy the SMS voucher or visit and enter anytime at <Link className="text-primary underline" href="/checkout/success">the connection page</Link>.</p>
                    </div>
                </div>
            </div>

            <p className="mt-3 text-muted-foreground">Purchasing is quick — the code arrives by SMS and works immediately. If you have trouble, contact support.</p>
        </section>
    )
}