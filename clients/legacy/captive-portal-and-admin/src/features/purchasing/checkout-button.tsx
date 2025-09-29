// import { getPlan } from './plan-catalog';
// import { payFastService } from './payfast-service';
// import { buildMPaymentId } from './payment-utils';

// interface CheckoutButtonProps { planId: string; label?: string; className?: string; }

// // Server component: renders a fully static HTML form with ordered PayFast hidden inputs.
// export function CheckoutButton({ planId, label = 'Pay with PayFast', className = '' }: CheckoutButtonProps) {
// 	const plan = getPlan(planId);
// 	if (!plan) return <div className="text-xs text-red-500">Unknown plan</div>;

// 	const { PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_TEST_MSISDN } = process.env;
// 	const missing = [
// 		!PAYFAST_MERCHANT_ID && 'PAYFAST_MERCHANT_ID',
// 		!PAYFAST_MERCHANT_KEY && 'PAYFAST_MERCHANT_KEY',
// 		!PAYFAST_PASSPHRASE && 'PAYFAST_PASSPHRASE'
// 	].filter(Boolean) as string[];

// 	if (missing.length) {
// 		return (
// 			<button disabled className="px-4 py-2 text-sm rounded bg-muted text-muted-foreground opacity-60" title={`Missing: ${missing.join(', ')}`}>Config Missing</button>
// 		);
// 	}

// 	const msisdn = PAYFAST_TEST_MSISDN || '27820000000';
// 	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
// 	const returnUrl = `${baseUrl}/checkout/success`;
// 	const cancelUrl = `${baseUrl}/checkout/cancel`;
// 	const notifyUrl = `${baseUrl}/api/payfast/ipn`;
// 	const mPaymentId = buildMPaymentId(plan.itemName, plan.numericId);
// 	const { actionUrl, fields } = payFastService.buildPaymentFields({
// 		plan,
// 		returnUrl,
// 		cancelUrl,
// 		notifyUrl,
// 	});
// 	return (
// 		<form action={actionUrl} method="post" className="flex flex-col items-end gap-1">
// 			{/* Hidden inputs rendered in the exact order returned by the service */}
// 			{Object.entries(fields).map(([k, v]) => (
// 				<input key={k} type="hidden" name={k} value={v} />
// 			))}
// 			<button
// 				type="submit"
// 				className={`px-4 py-2 text-sm rounded bg-primary text-primary-foreground ${className}`}
// 			>
// 				{label}
// 			</button>
// 		</form>
// 	);
// }


