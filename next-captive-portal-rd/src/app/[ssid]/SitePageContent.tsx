"use client";
import { useEffect, useState, useRef } from 'react';
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/AuthContext";
import { imageUrl } from "@/lib/image-url";
import AdSection from "@/components/ad-section";
import AuthMethodsCard from '@/components/home-page/AuthMethodsCard';
import PackageConnectCard from '@/components/home-page/PackageConnectCard';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';
import type { GatewayConfig, ActivePackage, WalletBalance } from '@/lib/types';
import type { PortalPackage } from '@/infrastructure/api/types';
import Link from 'next/link';
import PoweredByFooter from '@/components/PoweredByFooter';

function ProfileBadge() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) {
    return (
      <div className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: theme.brandAccent, color: '#fff' }}>
        Free WiFi
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md focus:outline-none"
        style={{ background: theme.brandAccent, color: '#fff' }}
        aria-label="Profile"
      >
        {user.firstName[0]}{user.lastName[0]}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 rounded-xl shadow-xl z-50 min-w-[160px] py-3 px-4 flex flex-col gap-2"
          style={{ background: theme.brandSecondary, border: `1px solid rgba(255,255,255,0.15)` }}
        >
          <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            {user.displayName}
          </p>
          <div className="h-px opacity-20" style={{ background: theme.textPrimary }} />
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="hover:pointer text-sm font-medium text-left py-1 opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: theme.textPrimary }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function PackageLimitChips({ pkg }: { pkg: PortalPackage }) {
  const chips: string[] = [];
  if (pkg.durationDays) chips.push(`${pkg.durationDays}d`);
  if (pkg.dataLimitEnabled && pkg.dataAmount && pkg.dataUnit) chips.push(`${pkg.dataAmount} ${pkg.dataUnit}`);
  if (pkg.speedLimitEnabled && pkg.speedDownloadAmount && pkg.speedDownloadUnit) chips.push(`${pkg.speedDownloadAmount} ${pkg.speedDownloadUnit} ↓`);
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {chips.map(c => (
        <span key={c} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{c}</span>
      ))}
    </div>
  );
}

function PackagesSection({
  ssid,
  user,
  balance,
  activePackage,
}: {
  ssid: string;
  user: boolean;
  balance: WalletBalance | null;
  activePackage: import('@/lib/types').ActivePackage | null;
}) {
  const [packages, setPackages] = useState<PortalPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wallet/packages?ssid=${encodeURIComponent(ssid)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { console.error('[PackagesSection]', d.error); return; }
        setPackages(d.packages ?? []);
      })
      .catch(e => console.error('[PackagesSection] fetch failed:', e))
      .finally(() => setLoading(false));
  }, [ssid]);

  if (loading) return null;
  if (packages.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px opacity-20 bg-current" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-60">Packages</span>
        <div className="flex-1 h-px opacity-20 bg-current" />
      </div>

      <div className="flex flex-col gap-2.5">
        {packages.map(pkg => {
          const price = Number(pkg.price);
          const isOwned = activePackage?.packageId === pkg.id && activePackage.status === 'Active';
          const canAfford = pkg.isFree || (balance ? balance.balance >= price : false);
          const showBalance = user && balance !== null;

          return (
            <div
              key={pkg.id}
              className={`rounded-2xl p-4 flex items-center gap-3 ${
                isOwned ? 'bg-white/70' : canAfford || !showBalance ? 'bg-white/90' : 'bg-white/50'
              }`}
              style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{pkg.name}</p>
                  {pkg.isFree && !isOwned && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 flex-shrink-0">FREE</span>
                  )}
                  {isOwned && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">ACTIVE</span>
                  )}
                </div>
                <PackageLimitChips pkg={pkg} />
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {!pkg.isFree && (
                  <span className={`text-base font-bold ${isOwned ? 'text-gray-400' : 'text-blue-600'}`}>
                    R{price.toFixed(2)}
                  </span>
                )}

                {isOwned ? (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400">
                    Owned
                  </span>
                ) : user ? (
                  canAfford ? (
                    <Link
                      href={`/${ssid}/packages/${pkg.id}/confirm`}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      {pkg.isFree ? 'Activate' : 'Buy'}
                    </Link>
                  ) : (
                    <Link
                      href={`/${ssid}/wallet/topup`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                    >
                      Top up
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/${ssid}/login`}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Login to buy
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SitePageContent({ gatewayConfig }: { gatewayConfig: GatewayConfig }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const ssid = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1]
    : '';

  useEffect(() => {
    try {
      const redirect = sessionStorage.getItem("post-connect-redirect");
      if (redirect && redirect !== "/") {
        sessionStorage.removeItem("post-connect-redirect");
        window.location.href = redirect;
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);

  useEffect(() => {
    if (!user) { setActivePackage(null); setBalance(null); return; }
    Promise.all([
      platformWalletApi.getActivePackage().catch(() => null),
      platformWalletApi.getBalance().catch(() => null),
    ]).then(([pkg, bal]) => {
      setActivePackage(pkg);
      setBalance(bal);
    });
  }, [user]);

  return (
    <div
      className="relative flex flex-col items-center max-w-md w-full min-h-screen"
      style={{ background: theme.brandPrimary }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{ background: theme.brandPrimaryHover, filter: 'blur(40px)', animationDuration: '3s' }} />
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{ background: theme.buttonPrimaryText, filter: 'blur(50px)', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: theme.brandAccent, filter: 'blur(60px)', animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top section */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 pt-6 pb-10">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-full mb-5 w-full justify-between"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div className="bg-white rounded-full p-1.5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(theme.logo, theme.ssid)} alt="Brand logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>
            {theme.name}
          </span>
          <ProfileBadge />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold leading-tight mb-1"
            style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            {theme.heading || `Welcome to ${theme.name}`}
          </h1>
          {theme.subheading && (
            <p className="text-xs opacity-75" style={{ color: theme.textPrimary }}>{theme.subheading}</p>
          )}
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative z-10 w-full -mt-6">
        <svg viewBox="0 0 428 48" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="w-full" preserveAspectRatio="none" style={{ display: 'block', height: '40px' }}>
          <path d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z" fill={theme.brandSecondary} />
        </svg>
      </div>

      {/* Bottom section — scrollable */}
      <div className="relative z-10 w-full flex-1 px-5 pb-24 pt-2"
        style={{ background: theme.brandSecondary, color: theme.textSecondary }}>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase opacity-60" style={{ color: theme.textSecondary }}>Get Started</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <div className="flex flex-col gap-3">
          {activePackage && activePackage.status === 'Active' && (
            <PackageConnectCard
              userPackageId={activePackage.id}
              packageName={activePackage.packageName}
              gatewayConfig={gatewayConfig}
            />
          )}
          <AuthMethodsCard gatewayConfig={gatewayConfig} />
        </div>

        <div className="flex items-center justify-center gap-1 mt-4">
          {[1, 2, 3, 4].map((bar) => (
            <div key={bar} className="rounded-full"
              style={{ width: '4px', height: `${bar * 5}px`, background: theme.brandPrimary, opacity: 0.4 + bar * 0.15 }} />
          ))}
          <span className="text-xs ml-2 font-medium opacity-60" style={{ color: theme.textSecondary }}>Strong signal</span>
        </div>

        <PackagesSection ssid={ssid} user={!!user} balance={balance} activePackage={activePackage} />

        <AdSection />
        <PoweredByFooter />
      </div>
    </div>
  );
}
