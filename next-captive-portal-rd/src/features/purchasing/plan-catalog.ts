/**
 * Plan Catalog (static)
 * -----------------------------------------
 * Provides a typed, in-memory catalog of voucher plans used for building
 * PayFast payment forms. Prices are stored as raw numeric ZAR amounts; any
 * formatting to two decimals (e.g. 10.00) is deferred to rendering / payment
 * field construction.
 */

export const CURRENCY = 'ZAR';

export interface Plan {
  id: string; // lowercase, digits, underscores allowed (e.g. "1_gb_voucher")
  numericId: number; // Sequential numeric reference for PayFast custom_int1
  name: string; // Human readable label (may match itemName)
  ssid: string; // SSID this plan applies to (captured at module init)
  price: number; // Stored as number (ZAR)
  downloadMbps: number;
  uploadMbps: number;
  itemId: string; // Mirrors id (internal reference)
  itemName: string; // Used as PayFast item_name
}

// Resolve SSID once; fallback keeps dev/demo resilient without throwing.
const SSID = process.env.SSID || 'UNKNOWN_SSID';

// Sample plans (adjust freely). Ids kept short & descriptive.
export const PLANS: readonly Plan[] = [
  {
    id: '1_gb_voucher',
    numericId: 1,
    name: '1 GB Voucher',
    ssid: SSID,
    price: 10,
    downloadMbps: 10,
    uploadMbps: 5,
    itemId: '1_gb_voucher',
    itemName: '1_gb_voucher'
  },
  {
    id: '5_gb_voucher',
    numericId: 2,
    name: '5 GB Voucher',
    ssid: SSID,
    price: 35,
    downloadMbps: 20,
    uploadMbps: 10,
    itemId: '5_gb_voucher',
    itemName: '5 GB Voucher'
  },
  {
    id: 'unlimited_day_voucher',
    numericId: 3,
    name: 'Unlimited Day Pass',
    ssid: SSID,
    price: 50,
    downloadMbps: 25,
    uploadMbps: 15,
    itemId: 'unlimited_day_voucher',
    itemName: 'Unlimited Day Pass'
  }
] as const;

export function getPlan(id: string): Plan | null {
  return (PLANS as Plan[]).find(p => p.id === id) || null;
}

export function listPlans(): Plan[] {
  // Spread into a new array to avoid accidental mutation attempts.
  return [...(PLANS as Plan[])];
}

// JSDoc quick reference:
// const plan = getPlan('1_gb_voucher');
// if (plan) { console.log(plan.price.toFixed(2)); }
