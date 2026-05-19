import { platformRequest } from './client';
import type { WalletBalance, WalletTransaction, ActivePackage } from '@/lib/types';

// ── API response shapes (match OpenAPI spec) ──────────────────────────────

interface WalletBalanceResponse {
  profileId: string;
  balance: number | string;
  availableBalance: number | string;
  currency: string;
}

interface WalletTransactionResponse {
  id: string;
  type: string;
  amount: number | string;
  currency: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payFastPaymentId: string | null;
  amountFee: number | string | null;
  amountNet: number | string | null;
}

interface UserPackageResponse {
  id: string;
  packageId: string;
  packageName: string;
  siteId: string;
  amountPaid: number | string;
  currency: string;
  status: string;
  purchasedAt: string;
  expiresAt: string | null;
}

export interface TopUpResponse {
  reference: string;
  amount: number | string;
  payFastAction: string;
  payFastFields: Record<string, string>;
}

// ── Adapters ───────────────────────────────────────────────────────────────

function toBalance(r: WalletBalanceResponse): WalletBalance {
  return { balance: Number(r.availableBalance), currency: r.currency };
}

function toTransaction(r: WalletTransactionResponse): WalletTransaction {
  return {
    id: r.id,
    type: r.type as WalletTransaction['type'],
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status as WalletTransaction['status'],
    reference: r.reference,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    payFastPaymentId: r.payFastPaymentId ?? null,
    amountFee: r.amountFee != null ? Number(r.amountFee) : null,
    amountNet: r.amountNet != null ? Number(r.amountNet) : null,
  };
}

function toActivePackage(r: UserPackageResponse): ActivePackage {
  return {
    id: r.id,
    packageName: r.packageName,
    purchasedAt: r.purchasedAt,
    expiresAt: r.expiresAt,
    status: r.status as ActivePackage['status'],
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

  getTransaction: async (transactionId: string): Promise<WalletTransaction> => {
    const r = await platformRequest<WalletTransactionResponse>(`/portal/wallet/transactions/${transactionId}`);
    return toTransaction(r);
  },

  getActivePackage: async (): Promise<ActivePackage | null> => {
    const r = await platformRequest<UserPackageResponse[]>('/portal/wallet/packages');
    const active = r.find(p => p.status === 'Active') ?? null;
    return active ? toActivePackage(active) : null;
  },

  initiateTopUp: async (amount: number, returnUrl: string, cancelUrl: string): Promise<TopUpResponse> => {
    return platformRequest<TopUpResponse>('/portal/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, siteId: null, returnUrl, cancelUrl }),
    });
  },

  purchasePackage: async (packageId: string): Promise<ActivePackage> => {
    const r = await platformRequest<UserPackageResponse>(`/portal/wallet/purchase/${packageId}`, {
      method: 'POST',
    });
    return toActivePackage(r);
  },
};
