'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';
import PoweredByFooter from '@/components/PoweredByFooter';

export default function RegisterPage() {
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
          <img src="/AuraConnect.png" alt="AuraConnect" className="h-10 w-auto" draggable={false} />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Create an account</h1>
            <p className="text-sm text-gray-500">Join to access the platform</p>
          </div>

          <RegisterForm
            onSuccess={() => router.replace(`/${ssid}/`)}
            loginHref={`/${ssid}/login`}
          />
        </div>

        <p className="mt-5 text-xs text-center text-gray-400">
          By registering you agree to our{' '}
          <a href="/terms-and-conditions" className="underline hover:text-gray-600">Terms &amp; Conditions</a>
        </p>
      </div>

      <PoweredByFooter />
    </div>
  );
}
