import type { WalletBalance, WalletTransaction, ActivePackage } from '@/lib/types';

export const MOCK_BALANCE: WalletBalance = { balance: 45.00, currency: 'ZAR' };

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  { id: '1', type: 'TopUp',           amount:  100, currency: 'ZAR', status: 'Completed', reference: 'ref-001', createdAt: '2026-05-10T10:00:00Z' },
  { id: '2', type: 'PackagePurchase', amount:  -50, currency: 'ZAR', status: 'Completed', reference: 'ref-002', createdAt: '2026-05-10T10:05:00Z' },
  { id: '3', type: 'TopUp',           amount:   20, currency: 'ZAR', status: 'Completed', reference: 'ref-003', createdAt: '2026-05-09T14:00:00Z' },
  { id: '4', type: 'PackagePurchase', amount:  -25, currency: 'ZAR', status: 'Completed', reference: 'ref-004', createdAt: '2026-05-08T09:00:00Z' },
];

export const MOCK_ACTIVE_PACKAGE: ActivePackage = {
  id: 'pkg-1',
  packageName: '7-Day Access',
  purchasedAt: '2026-05-10T10:05:00Z',
  expiresAt:   '2026-05-17T10:05:00Z',
  status: 'Active',
};
