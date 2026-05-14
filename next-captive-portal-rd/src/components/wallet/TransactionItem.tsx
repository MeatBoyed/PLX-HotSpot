'use client';
import type { WalletTransaction } from '@/lib/types';

interface Props {
  transaction: WalletTransaction;
}

const TYPE_ICON: Record<WalletTransaction['type'], string> = {
  TopUp: '⬆️',
  PackagePurchase: '📦',
  Refund: '↩️',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionItem({ transaction }: Props) {
  const isCredit = transaction.amount > 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
        {TYPE_ICON[transaction.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{transaction.description}</p>
        <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
        {isCredit ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
      </span>
    </div>
  );
}
