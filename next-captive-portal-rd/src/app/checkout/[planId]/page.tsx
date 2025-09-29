import { notFound } from 'next/navigation';
import { getPlan } from '@/features/purchasing/plan-catalog';
import { payFastService } from '@/features/purchasing/payfast-service';
import { env } from '@/env';

// Minimal container utility (reuse tailwind if available)
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-xl p-6 space-y-6">{children}</div>
);

// interface CheckoutPageProps {
//   params: { planId: string };
// }

export default async function CheckoutPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const plan = getPlan(planId);
  if (!plan) return notFound();

  // Validate env before constructing fields
  const { PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY } = process.env;
  const missing = [
    !PAYFAST_MERCHANT_ID && 'PAYFAST_MERCHANT_ID',
    !PAYFAST_MERCHANT_KEY && 'PAYFAST_MERCHANT_KEY'
  ].filter(Boolean) as string[];
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const returnUrl = `${baseUrl}/checkout/`;
  const cancelUrl = `${baseUrl}/checkout/cancel`;
  const notifyUrl = `${baseUrl}/api/payfast/ipn`;

  let form: { actionUrl: string; fields: Record<string, string> } | null = null;
  if (missing.length === 0) {
    form = payFastService.buildPaymentFields({ plan, returnUrl, cancelUrl, notifyUrl });
  }

  return (
    <Container>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Checkout – {plan.name}</h1>
        <p className="text-sm text-muted-foreground">Confirm your voucher purchase and proceed to secure PayFast payment.</p>
      </div>
      <div className="rounded border p-4 space-y-2">
        <div className="flex justify-between text-sm"><span>Plan</span><span>{plan.name}</span></div>
        <div className="flex justify-between text-sm"><span>Download</span><span>{plan.downloadMbps} Mbps</span></div>
        <div className="flex justify-between text-sm"><span>Upload</span><span>{plan.uploadMbps} Mbps</span></div>
        <div className="flex justify-between text-sm font-semibold"><span>Price</span><span>R {plan.price.toFixed(2)}</span></div>
        <div className="flex justify-between text-xs text-muted-foreground"><span>SSID</span><span>{plan.ssid}</span></div>
      </div>
      {missing.length > 0 && (
        <div className="rounded border border-red-400 bg-red-50 text-red-700 p-4 text-sm">
          <p className="font-medium mb-1">Configuration Incomplete</p>
          <p>Missing env vars: {missing.join(', ')}</p>
        </div>
      )}
      {form && (
        <form action={form.actionUrl} method="post" className="space-y-4">
          {/* Render hidden inputs following PayFast sample: iterate object, skip blanks */}
          {Object.entries(form.fields).map(([key, value]) => (
            value !== '' ? (
              <input key={key} type="hidden" name={key} value={value.trim()} />
            ) : null
          ))}
          <button
            type="submit"
            className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium"
          >
            Pay with PayFast
          </button>
        </form>
      )}
      <p className="text-xs text-muted-foreground">You will be redirected to PayFast. After payment you&apos;ll return to the success page. A voucher code will receive an SMS.</p>
    </Container>
  );
}
