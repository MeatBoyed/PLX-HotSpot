'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TopUpCancelPage() {
  const params = useParams();
  const ssid = params.ssid as string;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center w-full max-w-md">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-4xl mb-6">❌</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
      <p className="text-base text-gray-500 mb-8">Your top-up was not completed.</p>
      <Link href={`/${ssid}/wallet/topup`}
        className="px-8 py-3 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 transition-colors">
        Try Again
      </Link>
    </div>
  );
}
