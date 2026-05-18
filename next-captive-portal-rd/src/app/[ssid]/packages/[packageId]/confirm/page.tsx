'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import type { PortalPackage } from '@/infrastructure/api/types';
import type { WalletBalance } from '@/lib/types';

export default function ConfirmPackagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<PortalPackage | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/wallet/packages').then(r => r.json()).then(d => d.packages ?? []),
      platformWalletApi.getBalance(),
    ]).then(([pkgs, bal]: [PortalPackage[], WalletBalance]) => {
      setPkg(pkgs.find((p: PortalPackage) => p.id === packageId) ?? null);
      setBalance(bal);
    }).finally(() => setLoading(false));
  }, [user, ssid, packageId]);

  async function handleConfirm() {
    if (!pkg) return;
    setPurchasing(true);
    setError(null);
    try {
      await platformWalletApi.purchasePackage(packageId);
      router.push(`/${ssid}/wallet`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Purchase failed');
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full max-w-md">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center w-full max-w-md">
        <p className="text-gray-500 mb-4">Package not found</p>
        <Link href={`/${ssid}/packages`} className="text-sm font-semibold text-blue-600">Back to packages</Link>
      </div>
    );
  }

  const remaining = balance ? balance.balance - pkg.price : null;
  const canAfford = remaining !== null && remaining >= 0;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${ssid}/packages`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Confirm Purchase</h1>
        </div>
      </div>

      <div className="px-5 pt-5 pb-24 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</p>
          {pkg.description && <p className="text-xs text-gray-400 mb-3">{pkg.description}</p>}
          <p className="text-3xl font-bold text-blue-600">R{pkg.price.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Current balance</span>
            <span className="text-sm font-semibold text-gray-800">R{balance?.balance.toFixed(2) ?? '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Package cost</span>
            <span className="text-sm font-semibold text-red-500">-R{pkg.price.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Remaining</span>
            <span className={`text-sm font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
              R{remaining !== null ? remaining.toFixed(2) : '—'}
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-center text-red-500">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={purchasing || !canAfford}
          className="w-full py-4 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {purchasing ? 'Processing…' : 'Confirm Purchase'}
        </button>

        <Link href={`/${ssid}/packages`}
          className="block text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
          Cancel
        </Link>
      </div>
    </div>
  );
}
