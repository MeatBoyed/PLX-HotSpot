'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import ActivePackageCard from '@/components/wallet/ActivePackageCard';
import TransactionList from '@/components/wallet/TransactionList';
import type { WalletBalance, WalletTransaction, ActivePackage } from '@/lib/types';
import PoweredByFooter from '@/components/PoweredByFooter';

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${ssid}/login`);
  }, [user, authLoading, router, ssid]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      platformWalletApi.getBalance(),
      platformWalletApi.getActivePackage(),
      platformWalletApi.getTransactions(),
    ]).then(([b, pkg, txns]) => {
      setBalance(b);
      setActivePackage(pkg);
      setTransactions(txns);
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading || !balance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/${ssid}`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-900">My Wallet</h1>
        </div>
        <WalletBalanceCard balance={balance} />
      </div>

      <div className="px-5 pt-5 pb-24 flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active Package</p>
          <ActivePackageCard pkg={activePackage} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Transactions</p>
            <Link href={`/${ssid}/wallet/transactions`} className="text-xs font-semibold text-blue-600">
              View All
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
            <TransactionList transactions={transactions.slice(0, 5)} ssid={ssid} />
          </div>
        </div>
        <PoweredByFooter />
      </div>
    </div>
  );
}
