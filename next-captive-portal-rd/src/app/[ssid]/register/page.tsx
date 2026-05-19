'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { ssid } = useParams<{ ssid: string }>();

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/${ssid}/`);
    }
  }, [loading, user, ssid, router]);

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
            Create an account
          </h1>
          <p className="text-sm opacity-70" style={{ color: theme.textSecondary }}>
            Join to access the platform
          </p>
        </div>
        <RegisterForm
          onSuccess={() => router.replace(`/${ssid}/`)}
          loginHref={`/${ssid}/login`}
        />
      </div>
    </div>
  );
}
