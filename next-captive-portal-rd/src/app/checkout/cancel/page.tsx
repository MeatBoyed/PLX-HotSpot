const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-xl p-6 space-y-6">{children}</div>
);

export default function CheckoutCancelPage() {
  return (
    <Container>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Payment Cancelled</h1>
        <p className="text-sm text-muted-foreground">Your PayFast session was cancelled. You can choose another plan and try again.</p>
      </div>
      <a href="/" className="text-xs underline text-muted-foreground">Back to Home Page</a>
    </Container>
  );
}
