'use client';
import { useEffect, useRef, useState } from 'react';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import { useTheme } from '@/components/theme-provider';
import type { GatewayConfig, PackageCredentials } from '@/lib/types';

interface Props {
  userPackageId: string;
  packageName: string;
  gatewayConfig: GatewayConfig;
}

export default function PackageConnectCard({ userPackageId, packageName, gatewayConfig }: Props) {
  const { theme } = useTheme();
  const [creds, setCreds] = useState<PackageCredentials | null>(null);
  const [error, setError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    platformWalletApi.getCredentials(userPackageId)
      .then(setCreds)
      .catch(() => setError(true));
  }, [userPackageId]);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    formRef.current?.submit();
  }

  const action = creds?.gatewayUrl ?? gatewayConfig.loginUrl;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg p-4"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.6)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Active Package</p>
      </div>

      <p className="text-sm font-semibold text-gray-900 mb-1">{packageName}</p>
      <p className="text-xs text-gray-400 mb-3">Your package is ready — click to connect to the network.</p>

      {error ? (
        <p className="text-xs text-red-500 py-2 text-center">Could not load credentials. Please try again later.</p>
      ) : !creds ? (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: theme.buttonPrimary, borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          <form ref={formRef} method="GET" action={action} onSubmit={handleConnect}>
            <input type="hidden" name="username" value={creds.rdUsername} />
            <input type="hidden" name="password" value={creds.rdPassword} />
            <button
              type="submit"
              className="w-full rounded-xl font-bold py-3 text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
            >
              Connect Now
            </button>
          </form>
        </>
      )}
    </div>
  );
}
