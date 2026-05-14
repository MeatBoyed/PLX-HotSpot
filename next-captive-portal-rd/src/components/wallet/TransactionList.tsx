'use client';
import type { WalletTransaction } from '@/lib/types';
import TransactionItem from './TransactionItem';

interface Props {
  transactions: WalletTransaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p className="text-sm text-center py-6 text-gray-400">No transactions yet</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
    </div>
  );
}
