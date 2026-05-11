'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  // If session already exists, skip login and go straight to the connect page
  useEffect(() => {
    if (!loading && user) {
      router.replace(`/${theme.ssid}/`);
    }
  }, [loading, user, theme.ssid, router]);

  // Show nothing while the session check is in flight to avoid flicker
  if (loading) return null;
  if (user) return null;

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen w-full px-5"
      style={{ background: theme.brandPrimary }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ background: theme.brandSecondary }}
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ color: theme.textSecondary }}>
            Welcome back
          </h1>
          <p className="text-sm opacity-70" style={{ color: theme.textSecondary }}>
            Sign in to your account
          </p>
        </div>
        <LoginForm
          onSuccess={() => router.replace(`/${theme.ssid}/`)}
          registerHref={`/${theme.ssid}/register`}
        />
      </div>
    </div>
  );
}
