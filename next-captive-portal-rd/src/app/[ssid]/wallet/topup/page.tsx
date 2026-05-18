'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { platformWalletApi } from '@/infrastructure/api/platform/wallet.api';

const PRESETS = [10, 20, 50, 100, 200];

export default function TopUpPage() {
  const params = useParams();
  const ssid = params.ssid as string;

  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = selected ?? (custom ? parseFloat(custom) : null);
  const isValid = amount !== null && !isNaN(amount) && amount >= 10;

  async function handleProceed() {
    if (!isValid || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const returnUrl = `${origin}/${ssid}/wallet/topup/success`;
      const cancelUrl = `${origin}/${ssid}/wallet/topup/cancel`;
      const { payFastUrl } = await platformWalletApi.initiateTopUp(amount, returnUrl, cancelUrl);
      // Hard redirect — PayFast is an external payment page
      window.location.href = payFastUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate payment');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/${ssid}/wallet`}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Top Up Wallet</h1>
        </div>
      </div>

      <div className="px-5 pt-5 pb-24">
        <p className="text-sm font-semibold text-gray-500 mb-3">Select amount</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {PRESETS.map(preset => (
            <button
              key={preset}
              onClick={() => { setSelected(preset); setCustom(''); }}
              className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                selected === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
              }`}
            >
              R{preset}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-2">Or enter custom amount (min R10)</p>
        <div className="bg-white border border-gray-200 rounded-xl flex items-center gap-2 px-4 py-3 mb-6 focus-within:border-blue-500 transition-colors">
          <span className="font-bold text-gray-500">R</span>
          <input
            type="number"
            min={10}
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(null); }}
            placeholder="0.00"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-4 text-center">{error}</p>}

        <button
          onClick={handleProceed}
          disabled={!isValid || loading}
          className="w-full py-4 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Redirecting to payment…' : `Proceed to Pay${amount && isValid ? ` — R${amount}` : ''}`}
        </button>
      </div>
    </div>
  );
}
