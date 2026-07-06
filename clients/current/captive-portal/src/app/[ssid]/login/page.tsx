'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import PoweredByFooter from '@/components/PoweredByFooter';
import Link from 'next/link';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { ssid } = useParams<{ ssid: string }>();

  useEffect(() => {
    if (!loading && user) router.replace(`/${ssid}/`);
  }, [loading, user, ssid, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-between px-4 py-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/AuraConnect.png" alt="AuraConnect" className="w-auto h-52" draggable={false} />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          <LoginForm
            onSuccess={() => router.replace(`/${ssid}/`)}
            registerHref={`/${ssid}/register`}
          />

          {/* Social auth placeholder — ready for future providers */}
          {/* <div className="mt-5">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          </div> */}
        </div>

        <p className="mt-5 text-xs text-center text-gray-400">
          By signing in you agree to our{' '}
          <Link href="/terms-and-conditions" className="underline hover:text-gray-600">Terms &amp; Conditions</Link>
        </p>
      </div>

    </div>
  );
}
