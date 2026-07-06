import { redirect } from 'next/navigation';
import { packageService } from '@/lib/services/package-service';
import { buildPayfastFieldsAction } from './actions';
import CheckoutClient from './CheckoutClient';

// Minimal container utility (reuse tailwind if available)
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-xl p-6 space-y-6">{children}</div>
);

// interface CheckoutPageProps {
//   params: { planId: string };
// }

export default async function CheckoutPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  // planId comes from the slug: /checkout/[package_name]
  // Fetch package by name; if not found, redirect home
  const pkg = await packageService.getByName(decodeURI(planId));
  if (!pkg) {
    redirect('/');
  }
  // // Map DB package to the Plan shape expected by PayFast service
  // const plan: Plan = {
  //   id: String(pkg.id),
  //   numericId: pkg.id,
  //   name: pkg.name,
  //   ssid: pkg.ssid,
  //   price: pkg.price,
  //   downloadMbps: 0,
  //   uploadMbps: 0,
  //   itemId: String(pkg.id),
  //   itemName: pkg.name,
  // };

  // Render phone capture form (always outside PayFast form). On submit, server action returns PayFast fields.
  // The client will hydrate and show the PayFast form based on action response.

  return (
    <Container>
      <CheckoutClient planName={pkg.name} price={pkg.price} ssid={pkg.ssid} description={pkg.description ?? ''} action={buildPayfastFieldsAction} />
      <p className="text-xs text-muted-foreground">We&apos;ll use your number for voucher delivery and PayFast checkout.</p>
    </Container>
  );
}
