import { platformRequest } from './client';
import type { WalletBalance, WalletTransaction, ActivePackage } from '@/lib/types';

// ── API response shapes ────────────────────────────────────────────────────

interface WalletBalanceResponse {
  profileId: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

interface WalletTransactionResponse {
  id: string;
  blnkTransactionId: string | null;
  type: 'TopUp' | 'PackagePurchase' | 'Refund';
  amount: number;
  currency: string;
  reference: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
}

interface UserPackageResponse {
  id: string;
  packageId: string;
  packageName: string;
  siteId: string;
  amountPaid: number;
  currency: string;
  status: 'Active' | 'Expired' | 'Pending';
  purchasedAt: string;
  expiresAt: string | null;
}

export interface TopUpResponse {
  reference: string;
  amount: number;
  payFastUrl: string;
}

// ── Adapters ───────────────────────────────────────────────────────────────

function toBalance(r: WalletBalanceResponse): WalletBalance {
  // Use availableBalance (spendable) rather than gross balance
  return { balance: Number(r.availableBalance), currency: r.currency };
}

function toTransaction(r: WalletTransactionResponse): WalletTransaction {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    reference: r.reference,
    createdAt: r.createdAt,
  };
}

function toActivePackage(r: UserPackageResponse): ActivePackage {
  return {
    id: r.id,
    packageName: r.packageName,
    purchasedAt: r.purchasedAt,
    expiresAt: r.expiresAt,
    status: r.status,
  };
}

// ── API ────────────────────────────────────────────────────────────────────

export const platformWalletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const r = await platformRequest<WalletBalanceResponse>('/portal/wallet/balance');
    return toBalance(r);
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const r = await platformRequest<WalletTransactionResponse[]>('/portal/wallet/transactions');
    return r.map(toTransaction);
  },

  // Returns the most recent Active package, or null
  getActivePackage: async (): Promise<ActivePackage | null> => {
    const r = await platformRequest<UserPackageResponse[]>('/portal/wallet/packages');
    const active = r.find(p => p.status === 'Active') ?? null;
    return active ? toActivePackage(active) : null;
  },

  // returnUrl / cancelUrl are absolute URLs PayFast will redirect back to
  initiateTopUp: async (amount: number, returnUrl: string, cancelUrl: string): Promise<TopUpResponse> => {
    return platformRequest<TopUpResponse>('/portal/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, returnUrl, cancelUrl }),
    });
  },

  purchasePackage: async (packageId: string): Promise<ActivePackage> => {
    const r = await platformRequest<UserPackageResponse>(`/portal/wallet/purchase/${packageId}`, {
      method: 'POST',
    });
    return toActivePackage(r);
  },
};
