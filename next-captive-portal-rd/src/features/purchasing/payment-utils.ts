// Shared payment utilities (server-side only)
import 'server-only';

export function buildMPaymentId(planName: string, numericId: number): string {
  const base = planName
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$|--+/g, '-')
    .toLowerCase();
  const shortTs = Date.now().toString().slice(-6); // rolling suffix
  return `${base}-${numericId}-${shortTs}`;
}
