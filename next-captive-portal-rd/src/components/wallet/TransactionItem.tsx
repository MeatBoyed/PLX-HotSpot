'use client';
import Link from 'next/link';
import type { WalletTransaction } from '@/lib/types';

interface Props {
  transaction: WalletTransaction;
  href?: string;
}

const TYPE_META: Record<string, { icon: string; label: string }> = {
  TopUp:           { icon: '⬆️', label: 'Wallet top-up' },
  PackagePurchase: { icon: '📦', label: 'Package purchase' },
  Refund:          { icon: '↩️', label: 'Refund' },
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  Completed: { label: 'Completed', className: 'bg-green-50 text-green-600' },
  Pending:   { label: 'Pending',   className: 'bg-yellow-50 text-yellow-600' },
  Failed:    { label: 'Failed',    className: 'bg-red-50 text-red-500' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionItem({ transaction, href }: Props) {
  const isCredit = transaction.amount > 0;
  const meta = TYPE_META[transaction.type] ?? { icon: '💳', label: transaction.type };
  const status = STATUS_META[transaction.status] ?? { label: transaction.status, className: 'bg-gray-50 text-gray-500' };
  const isFailed = transaction.status === 'Failed';

  const inner = (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${isFailed ? 'bg-red-50 opacity-50' : isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isFailed ? 'text-gray-400' : 'text-gray-800'}`}>{meta.label}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${isFailed ? 'text-gray-300 line-through' : isCredit ? 'text-green-600' : 'text-red-500'}`}>
        {isCredit ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href} className="block hover:bg-gray-50 -mx-4 px-4 rounded-xl transition-colors">{inner}</Link>;
  }
  return inner;
}
