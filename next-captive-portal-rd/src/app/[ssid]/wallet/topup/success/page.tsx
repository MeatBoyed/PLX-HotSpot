'use client';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const ssid = params.ssid as string;
  const amount = searchParams.get('amount') ?? '0';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center w-full max-w-md">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-4xl mb-6">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Received</h1>
      <p className="text-base text-gray-500 mb-8">
        R{parseFloat(amount).toFixed(2)} has been added to your wallet.
      </p>
      <Link href={`/${ssid}/wallet`}
        className="px-8 py-3 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 transition-colors">
        Back to Wallet
      </Link>
    </div>
  );
}

export default function TopUpSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
