'use client';
import type { WalletBalance } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Props {
  balance: WalletBalance;
}

export default function WalletBalanceCard({ balance }: Props) {
  const params = useParams();
  const ssid = params.ssid as string;

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-1 bg-blue-600 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Wallet Balance</p>
      <p className="text-4xl font-bold text-white">R{balance.balance.toFixed(2)}</p>
      <p className="text-xs text-blue-200">{balance.currency}</p>
      <Link
        href={`/${ssid}/wallet/topup`}
        className="mt-3 self-start text-xs font-bold px-4 py-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors"
      >
        + Top Up
      </Link>
    </div>
  );
}
