'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export function SplashClient() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #8ba5b2 0%, #b8cc00 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-8 pb-2">
        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Image src="/AuraConnect-48px.png" alt="AuraConnect" width={30} height={30} className="object-contain" />
        </div>
        <span className="border border-white/50 rounded-full px-4 py-1.5 text-white text-[11px] font-semibold uppercase tracking-widest">
          Free WiFi
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="flex justify-center mb-6">
          <Image
            src="/AuraConnect-48px.png"
            alt="AuraConnect"
            width={180}
            height={180}
            className="opacity-90"
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
            Welcome to<br />AuraConnect WiFi
          </h1>
          <div className="mt-2 h-0.5 w-8 bg-blue-500 rounded-full" />
        </div>

        <p className="mt-3 text-4xl font-light text-white/30 tracking-wide select-none">
          Aura Connect
        </p>
      </div>

      {/* Bottom */}
      <div className="px-5 pb-12 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(!!v)}
            className="mt-0.5 rounded-full border-gray-700 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
          />
          <span className="text-sm text-gray-900 leading-relaxed">
            I agree to the{' '}
            <span className="font-semibold underline underline-offset-2">terms and conditions</span>
            {' '}for use of this service.
          </span>
        </label>

        <button
          onClick={() => accepted && router.push('/login')}
          disabled={!accepted}
          className={cn(
            'w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all',
            accepted
              ? 'bg-[#b8cc00] text-gray-900 shadow-md'
              : 'bg-[#b8cc00]/40 text-gray-900/40 cursor-not-allowed'
          )}
        >
          Accept &amp; Connect
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
