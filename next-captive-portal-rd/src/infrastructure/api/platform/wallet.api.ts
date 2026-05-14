import type { WalletBalance, WalletTransaction, ActivePackage } from '@/lib/types';
import { MOCK_BALANCE, MOCK_TRANSACTIONS, MOCK_ACTIVE_PACKAGE } from '@/lib/mock/wallet.mock';

export const platformWalletApi = {
  getBalance: (): Promise<WalletBalance> =>
    Promise.resolve(MOCK_BALANCE),

  getTransactions: (): Promise<WalletTransaction[]> =>
    Promise.resolve(MOCK_TRANSACTIONS),

  getActivePackage: (): Promise<ActivePackage | null> =>
    Promise.resolve(MOCK_ACTIVE_PACKAGE),

  initiateTopUp: (_amount: number): Promise<{ payFastUrl: string }> =>
    Promise.resolve({ payFastUrl: '#mock-payfast' }),

  purchasePackage: (_packageId: string): Promise<ActivePackage> =>
    Promise.resolve(MOCK_ACTIVE_PACKAGE),
};
