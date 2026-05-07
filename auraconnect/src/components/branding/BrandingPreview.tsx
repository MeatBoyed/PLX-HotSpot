'use client'

import type { BrandingConfig } from '@/lib/types/branding.types'
import { resolveImageUrl } from '@/lib/infrastructure/api/branding.api'

export function BrandingPreview({ config }: { config: Partial<BrandingConfig> }) {
  return (
    <div
      className="rounded-lg overflow-hidden border w-full max-w-sm mx-auto text-sm"
      style={{
        backgroundColor: config.surfaceCard ?? '#1e293b',
        borderColor: config.surfaceBorder ?? '#334155',
      }}
    >
      {/* Header */}
      <div
        className="p-3 flex items-center gap-2"
        style={{
          backgroundColor: config.surfaceWhite ?? '#0f172a',
          borderBottom: `1px solid ${config.surfaceBorder ?? '#334155'}`,
        }}
      >
        {config.logoUrl && (
          <img
            src={resolveImageUrl(config.logoUrl)}
            alt="Logo"
            className="h-6 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 text-center">
        <h2 className="text-lg font-bold" style={{ color: config.textPrimary ?? '#f8fafc' }}>
          {config.heading || config.displayName || 'Welcome'}
        </h2>
        <p className="text-xs" style={{ color: config.textSecondary ?? '#94a3b8' }}>
          {config.subheading || 'Connect to get started'}
        </p>

        {/* Mock form fields */}
        <div className="space-y-2">
          {['Phone number', 'Email (optional)'].map((placeholder) => (
            <div
              key={placeholder}
              className="rounded px-3 py-2 text-left text-xs"
              style={{
                backgroundColor: config.surfaceCard ?? '#1e293b',
                border: `1px solid ${config.surfaceBorder ?? '#334155'}`,
                color: config.textSecondary ?? '#94a3b8',
              }}
            >
              {placeholder}
            </div>
          ))}
        </div>

        <button
          className="w-full rounded py-2 text-xs font-semibold"
          style={{
            backgroundColor: config.buttonPrimary ?? config.brandPrimary ?? '#6366f1',
            color: config.buttonPrimaryText ?? '#ffffff',
          }}
        >
          {config.buttonText || 'Connect Now'}
        </button>

        <p className="text-[10px]" style={{ color: config.textMuted ?? config.textSecondary ?? '#94a3b8' }}>
          {config.termsLinks || 'By connecting, you agree to our Terms'}
        </p>
      </div>

      {/* Footer */}
      <div
        className="p-2 text-center text-[10px]"
        style={{
          backgroundColor: config.surfaceWhite ?? '#0f172a',
          color: config.textMuted ?? config.textSecondary ?? '#94a3b8',
          borderTop: `1px solid ${config.surfaceBorder ?? '#334155'}`,
        }}
      >
        {config.venueLabel ? `${config.venueLabel} · ` : ''}Powered by AuraConnect
      </div>
    </div>
  )
}
