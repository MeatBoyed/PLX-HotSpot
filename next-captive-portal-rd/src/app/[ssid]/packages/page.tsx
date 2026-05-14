'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import type { ApiPortalPackage } from '@/infrastructure/api/portal/packages.api';
import type { WalletBalance } from '@/lib/types';

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;

  const [packages, setPackages] = useState<ApiPortalPackage[]>([]);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${ssid}/login`);
  }, [user, authLoading, router, ssid]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/packages?ssid=${encodeURIComponent(ssid)}`).then(r => r.json()).then(d => d.packages ?? []),
      platformWalletApi.getBalance(),
    ]).then(([pkgs, bal]) => {
      setPackages(pkgs);
      setBalance(bal);
    }).finally(() => setLoading(false));
  }, [user, ssid]);

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Packages</h1>
          {balance && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
              Balance: R{balance.balance.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <p className="text-center py-10 text-sm text-gray-400">No packages available</p>
        ) : (
          <div className="flex flex-col gap-3">
            {packages.map(pkg => {
              const canAfford = balance ? balance.balance >= pkg.price : false;
              return (
                <div key={pkg.id}
                  className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${!canAfford ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-semibold text-sm text-gray-900">{pkg.name}</p>
                      {pkg.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
                      )}
                    </div>
                    <p className="text-xl font-bold text-blue-600 flex-shrink-0">R{pkg.price.toFixed(2)}</p>
                  </div>
                  {canAfford ? (
                    <Link
                      href={`/${ssid}/packages/${pkg.id}/confirm`}
                      className="block text-center text-sm font-bold py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Buy
                    </Link>
                  ) : (
                    <div className="text-center text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-500">
                      Insufficient funds — top up to purchase
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
