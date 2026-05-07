'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Wallet, Package, Clock, Database, ChevronRight, TrendingUp, LogOut, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { Bundle } from '@/lib/types/bundle.types'
import type { Transaction } from '@/lib/types/transaction.types'

const ACCENT = '#b8cc00'
const NAVY = '#0d2238'

const MOCK_USER = {
  name: 'Thabo Molefe',
  email: 'thabo.molefe@gmail.com',
  initials: 'TM',
  walletBalanceCents: 4550,
  activeBundle: {
    name: '24hr Access',
    expiresAt: '2025-05-06T18:30:00Z',
    dataUsedMb: 342,
    dataLimitMb: undefined as number | undefined,
  },
  siteName: 'Main Hall',
  ssid: 'JoTheatre-MainHall',
}

const MOCK_BUNDLES: Bundle[] = [
  { id: 'b1', siteId: 'site_joburg_main', tenantId: 'tenant_joburg', name: '24hr Access',
    description: '24 Hrs • Unlimited', priceCents: 1000, durationSeconds: 86400,
    radiusProfile: '24hr_basic', isActive: true, sortOrder: 1 },
  { id: 'b2', siteId: 'site_joburg_main', tenantId: 'tenant_joburg', name: '7-Day Plan',
    description: '7 Days • 5 GB', priceCents: 5000, durationSeconds: 604800, dataLimitMb: 5120,
    radiusProfile: '7day_standard', isActive: true, sortOrder: 2 },
  { id: 'b3', siteId: 'site_joburg_main', tenantId: 'tenant_joburg', name: '30-Day Plan',
    description: '30 Days • 20 GB', priceCents: 15000, durationSeconds: 2592000, dataLimitMb: 20480,
    radiusProfile: '30day_premium', isActive: true, sortOrder: 3 },
]

const MOCK_TRANSACTIONS: Pick<Transaction, 'id' | 'type' | 'amountCents' | 'description' | 'createdAt'>[] = [
  { id: 't1', type: 'topup', amountCents: 5000, description: 'Wallet top-up via PayFast', createdAt: '2025-05-01T09:00:00Z' },
  { id: 't2', type: 'purchase', amountCents: -1000, description: 'Bundle — 24hr Access', createdAt: '2025-05-04T18:30:00Z' },
]

function SignalBars() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-[3px]">
        {[5, 9, 13, 17].map((h, i) => (
          <div key={i} className="w-1.5 rounded-sm" style={{ height: `${h}px`, backgroundColor: ACCENT }} />
        ))}
      </div>
      <span className="text-sm text-white/60">Strong signal</span>
    </div>
  )
}

export function HomeClient() {
  const [user] = useState(MOCK_USER)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [purchased, setPurchased] = useState<string | null>(null)

  const handlePurchase = async (bundle: Bundle) => {
    if (user.walletBalanceCents < bundle.priceCents) return
    setPurchasing(bundle.id)
    await new Promise((r) => setTimeout(r, 1000))
    setPurchasing(null)
    setPurchased(bundle.id)
    setTimeout(() => setPurchased(null), 3000)
  }

  const bundleProgress = user.activeBundle?.dataLimitMb
    ? Math.min(100, (user.activeBundle.dataUsedMb / user.activeBundle.dataLimitMb) * 100)
    : null

  const timeUntilExpiry = user.activeBundle
    ? Math.max(0, new Date(user.activeBundle.expiresAt).getTime() - Date.now())
    : 0
  const hoursRemaining = Math.floor(timeUntilExpiry / 3600000)
  const minsRemaining = Math.floor((timeUntilExpiry % 3600000) / 60000)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NAVY }}>

      {/* Green hero section */}
      <div style={{ background: 'linear-gradient(180deg, #8ba5b2 0%, #9dc000 85%)' }}>
        {/* Nav bar */}
        <div className="flex items-center justify-between px-5 pt-8 pb-4">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Image src="/AuraConnect-48px.png" alt="AuraConnect" width={26} height={26} className="object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm">{user.name}</p>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900" style={{ backgroundColor: ACCENT }}>
              {user.initials}
            </div>
            <button className="text-white/60 hover:text-white transition-colors ml-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero text */}
        <div className="px-6 pt-2 pb-14 text-center">
          <h1 className="text-2xl font-extrabold text-white leading-snug">
            Welcome to AuraConnect<br />WiFi Platform
          </h1>
          <p className="mt-1.5 text-sm text-white/70">{user.siteName} · {user.ssid}</p>
        </div>

        {/* Wave */}
        <svg viewBox="0 0 375 56" className="w-full block" preserveAspectRatio="none" style={{ marginBottom: '-1px' }}>
          <path d="M0,28 C80,56 290,0 375,28 L375,56 L0,56 Z" fill={NAVY} />
        </svg>
      </div>

      {/* Dark navy section */}
      <div className="flex-1 px-5 pb-12" style={{ backgroundColor: NAVY }}>

        {/* GET STARTED label */}
        <p className="text-center text-white/40 text-[11px] font-semibold uppercase tracking-widest pt-5 pb-4">
          Get Started
        </p>

        {/* Active bundle OR promo card */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          {user.activeBundle ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-muted-foreground">Active Bundle</span>
                <Badge variant="outline" className="text-xs text-green-700 border-green-300">Active</Badge>
              </div>
              <p className="font-bold text-lg">{user.activeBundle.name}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {hoursRemaining > 0 ? `${hoursRemaining}h ${minsRemaining}m remaining` : `${minsRemaining}m remaining`}
                </span>
                <span className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" />
                  {user.activeBundle.dataUsedMb} MB used
                </span>
              </div>
              {bundleProgress !== null && (
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={cn('h-full rounded-full', bundleProgress > 80 ? 'bg-red-500' : 'bg-[#b8cc00]')}
                      style={{ width: `${bundleProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{user.activeBundle.dataUsedMb} MB / {user.activeBundle.dataLimitMb} MB</p>
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-muted-foreground">Promotion</span>
              <p className="font-bold text-xl mt-1">Connect for Free</p>
              <p className="text-sm text-muted-foreground">24 Hrs • 1.5 GB</p>
              <button
                className="w-full h-12 rounded-full font-bold text-gray-900"
                style={{ backgroundColor: ACCENT }}
                onClick={() => handlePurchase(MOCK_BUNDLES[0])}
              >
                Connect Now
              </button>
            </>
          )}
        </div>

        {/* Signal */}
        <div className="flex justify-center mt-6">
          <SignalBars />
        </div>

        {/* Wallet */}
        <div className="mt-8 rounded-2xl p-4 space-y-2" style={{ backgroundColor: '#152d45' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            <button className="text-xs font-medium flex items-center gap-1" style={{ color: ACCENT }}>
              Top up <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <p className="text-3xl font-bold tabular-nums text-white">{formatCurrency(user.walletBalanceCents / 100)}</p>
        </div>

        {/* Buy bundles */}
        <div className="mt-6 space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            {user.activeBundle ? 'Buy Another Bundle' : 'Choose a Bundle'}
          </h2>
          <div className="space-y-2">
            {MOCK_BUNDLES.map((bundle) => {
              const canAfford = user.walletBalanceCents >= bundle.priceCents
              const isLoading = purchasing === bundle.id
              const isDone = purchased === bundle.id
              return (
                <div key={bundle.id}
                  className={cn('rounded-xl p-4 flex items-center gap-3 transition-colors', canAfford ? 'opacity-100' : 'opacity-50')}
                  style={{ backgroundColor: '#152d45' }}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}22` }}>
                    <Zap className="h-4 w-4" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">{bundle.name}</p>
                    <p className="text-xs text-white/50">{bundle.description}</p>
                  </div>
                  <p className="font-bold text-sm text-white shrink-0">{formatCurrency(bundle.priceCents / 100)}</p>
                  <button
                    disabled={!canAfford || !!purchasing}
                    onClick={() => handlePurchase(bundle)}
                    className={cn(
                      'shrink-0 w-16 h-8 rounded-full text-xs font-bold transition-all',
                      canAfford ? 'text-gray-900' : 'text-white/40 border border-white/20'
                    )}
                    style={canAfford ? { backgroundColor: ACCENT } : {}}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4 mx-auto" /> : isLoading ? '…' : 'Buy'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Recent Activity</h2>
            <button className="text-xs flex items-center gap-1 font-medium" style={{ color: ACCENT }}>
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {MOCK_TRANSACTIONS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: '#152d45' }}>
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                  t.amountCents > 0 ? 'bg-green-900/50' : 'bg-white/5')}>
                  {t.amountCents > 0
                    ? <TrendingUp className="h-4 w-4 text-green-400" />
                    : <Package className="h-4 w-4 text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.description}</p>
                  <p className="text-xs text-white/40">{formatRelativeTime(t.createdAt)}</p>
                </div>
                <span className={cn('text-sm font-semibold tabular-nums shrink-0',
                  t.amountCents > 0 ? 'text-green-400' : 'text-white/70')}>
                  {t.amountCents > 0 ? '+' : ''}{formatCurrency(t.amountCents / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
