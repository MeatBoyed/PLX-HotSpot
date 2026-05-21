'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import type { PortalPackage } from '@/infrastructure/api/types';
import type { WalletBalance } from '@/lib/types';

function formatLimit(amount: number | null | undefined, unit: string | null | undefined): string | null {
  if (!amount || !unit) return null;
  return `${amount} ${unit}`;
}

function PackageLimitChips({ pkg }: { pkg: PortalPackage }) {
  const chips: string[] = [];
  if (pkg.durationDays) chips.push(`${pkg.durationDays}d`);
  if (pkg.dataLimitEnabled && pkg.dataAmount && pkg.dataUnit)
    chips.push(formatLimit(pkg.dataAmount, pkg.dataUnit)!);
  if (pkg.speedLimitEnabled && pkg.speedDownloadAmount && pkg.speedDownloadUnit)
    chips.push(`${pkg.speedDownloadAmount} ${pkg.speedDownloadUnit} ↓`);
  if (pkg.timeLimitEnabled && pkg.timeAmount && pkg.timeUnit)
    chips.push(formatLimit(pkg.timeAmount, pkg.timeUnit)!);
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map(c => (
        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
          {c}
        </span>
      ))}
    </div>
  );
}

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;

  const [packages, setPackages] = useState<PortalPackage[]>([]);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${ssid}/login`);
  }, [user, authLoading, router, ssid]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/wallet/packages').then(r => r.json()).then(d => d.packages ?? []),
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
              const canAfford = pkg.isFree || (balance ? balance.balance >= Number(pkg.price) : false);
              return (
                <div key={pkg.id}
                  className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${!canAfford ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900">{pkg.name}</p>
                        {pkg.isFree && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                            FREE
                          </span>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
                      )}
                    </div>
                    {!pkg.isFree && (
                      <p className="text-xl font-bold text-blue-600 flex-shrink-0">
                        R{Number(pkg.price).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <PackageLimitChips pkg={pkg} />

                  <div className="mt-3">
                    {canAfford ? (
                      <Link
                        href={`/${ssid}/packages/${pkg.id}/confirm`}
                        className="block text-center text-sm font-bold py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        {pkg.isFree ? 'Activate' : 'Buy'}
                      </Link>
                    ) : (
                      <Link
                        href={`/${ssid}/wallet/topup`}
                        className="block text-center text-xs font-bold py-2.5 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                      >
                        Top up to purchase
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
