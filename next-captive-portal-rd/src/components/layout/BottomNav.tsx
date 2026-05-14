'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

const HIDE_SUFFIXES = ['/splash', '/login', '/register'];

const TABS = [
  { label: 'Home',     icon: '🏠', path: '' },
  { label: 'Wallet',   icon: '💳', path: '/wallet' },
  { label: 'Packages', icon: '📦', path: '/packages' },
  { label: 'Profile',  icon: '👤', path: '/profile' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const params = useParams();
  const ssid = params.ssid as string;

  if (!user) return null;
  if (HIDE_SUFFIXES.some(s => pathname.endsWith(s))) return null;

  const base = `/${ssid}`;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white border-t border-gray-200 flex items-center justify-around"
      style={{ height: '60px' }}>
      {TABS.map(tab => {
        const href = `${base}${tab.path}`;
        const isActive = tab.path === ''
          ? pathname === base || pathname === `${base}/`
          : pathname.startsWith(`${base}${tab.path}`);

        return (
          <Link key={tab.label} href={href}
            className="flex flex-col items-center gap-0.5 flex-1 py-1">
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
