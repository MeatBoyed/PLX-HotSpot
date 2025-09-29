import { Suspense } from 'react';
import { PlanCard } from '@/components/plan-card';
import Link from "next/link"
// interface SuccessProps { searchParams: { code?: string } }

const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto max-w-xl p-6 space-y-6">{children}</div>
);

export default function CheckoutSuccessPage() {
    // const code = useSearch;
    return (
        <Container>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Payment Redirected</h1>
                <p className="text-sm text-muted-foreground">If your payment completed successfully your voucher will arrive shortly via SMS. Already have it? Enter below.</p>
            </div>
            {/* {code && (
                <div className="rounded border p-3 text-xs">Detected code parameter: <span className="font-mono">{code}</span></div>
            )} */}
            <Suspense fallback={<div className="text-sm">Loading voucher form…</div>}>
                {/* <VoucherLoginFormButton /> */}
                <PlanCard
                    variant="voucher"
                    // onDismiss={() => setShowVoucherInput(false)}
                    className="w-full"
                />
            </Suspense>
            <Link href="/" className="text-xs underline text-muted-foreground">Return to portal home</Link>
        </Container>
    );
}
