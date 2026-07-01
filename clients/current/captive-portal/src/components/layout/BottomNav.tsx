'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Home, Wallet, CircleUser } from 'lucide-react';

const HIDE_SUFFIXES = ['/splash', '/login', '/register'];

const TABS = [
  { label: 'Home',    Icon: Home,       path: '' },
  { label: 'Wallet',  Icon: Wallet,     path: '/wallet' },
  { label: 'Profile', Icon: CircleUser, path: '/profile' },
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
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white border-t border-gray-100"
      style={{ height: '60px' }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {TABS.map(({ label, Icon, path }) => {
          const href = `${base}${path}`;
          const isActive = path === ''
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(`${base}${path}`);

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold tracking-wide`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
