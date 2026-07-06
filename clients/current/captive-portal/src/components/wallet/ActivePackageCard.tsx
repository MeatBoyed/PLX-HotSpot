'use client';
import type { ActivePackage } from '@/lib/types';

interface Props {
  pkg: ActivePackage | null;
}

function daysRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry';
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  return `${days} day${days !== 1 ? 's' : ''} remaining`;
}

export default function ActivePackageCard({ pkg }: Props) {
  if (!pkg) {
    return (
      <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">📦</div>
        <div>
          <p className="text-sm font-semibold text-gray-800">No active package</p>
          <p className="text-xs text-gray-400">Browse packages to get connected</p>
        </div>
      </div>
    );
  }

  const statusColor = pkg.status === 'Active' ? 'text-green-600 bg-green-50'
    : pkg.status === 'Expired' ? 'text-red-600 bg-red-50'
    : 'text-amber-600 bg-amber-50';

  return (
    <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">📶</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{pkg.packageName}</p>
        <p className="text-xs text-gray-400">{daysRemaining(pkg.expiresAt)}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{pkg.status}</span>
    </div>
  );
}
