'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import TransactionList from '@/components/wallet/TransactionList';
import type { WalletTransaction } from '@/lib/types';

export default function TransactionsPage() {
  const { user } = useAuth();
  const params = useParams();
  const ssid = params.ssid as string;
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    platformWalletApi.getTransactions().then(setTransactions).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${ssid}/wallet`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
        </div>
      </div>

      <div className="px-5 pt-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
            <TransactionList transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
}
