'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import type { WalletTransaction } from '@/lib/types';

const TYPE_META: Record<string, { icon: string; label: string }> = {
  TopUp:           { icon: '⬆️', label: 'Wallet top-up' },
  PackagePurchase: { icon: '📦', label: 'Package purchase' },
  Refund:          { icon: '↩️', label: 'Refund' },
};

const STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-green-50 text-green-700',
  Pending:   'bg-yellow-50 text-yellow-700',
  Failed:    'bg-red-50 text-red-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%] break-all">{value}</span>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { ssid, transactionId } = useParams<{ ssid: string; transactionId: string }>();
  const [tx, setTx] = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    platformWalletApi.getTransaction(transactionId)
      .then(setTx)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load transaction'))
      .finally(() => setLoading(false));
  }, [transactionId]);

  const meta = tx ? (TYPE_META[tx.type] ?? { icon: '💳', label: tx.type }) : null;
  const isCredit = tx ? tx.amount > 0 : false;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${ssid}/wallet/transactions`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Transaction</h1>
        </div>
      </div>

      <div className="px-5 pt-5 pb-24">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-center text-red-500 py-10">{error}</p>}
        {tx && meta && (
          <>
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                {meta.icon}
              </div>
              <p className="text-sm font-semibold text-gray-500">{meta.label}</p>
              <p className={`text-3xl font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                {isCredit ? '+' : ''}R{Math.abs(tx.amount).toFixed(2)}
              </p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[tx.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {tx.status}
              </span>
            </div>

            {/* Detail rows */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
              <Row label="Reference" value={tx.reference} />
              {tx.payFastPaymentId && <Row label="PayFast ID" value={tx.payFastPaymentId} />}
              {tx.amountFee != null && <Row label="Fee" value={`R${tx.amountFee.toFixed(2)}`} />}
              {tx.amountNet != null && <Row label="Net received" value={`R${tx.amountNet.toFixed(2)}`} />}
              <Row label="Date" value={formatDate(tx.createdAt)} />
              {tx.updatedAt !== tx.createdAt && <Row label="Updated" value={formatDate(tx.updatedAt)} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
