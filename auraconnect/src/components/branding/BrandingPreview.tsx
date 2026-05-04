'use client'

import type { BrandingConfig } from '@/lib/types/branding.types'

export function BrandingPreview({ config }: { config: Partial<BrandingConfig> }) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-border w-full max-w-sm mx-auto text-sm"
      style={{ backgroundColor: config.backgroundColor ?? '#0f172a' }}
    >
      {/* Header */}
      <div
        className="p-3 flex items-center gap-2"
        style={{ backgroundColor: config.headerBgColor ?? '#0f172a', borderBottom: `1px solid ${config.borderColor ?? '#334155'}` }}
      >
        {config.logoUrl && (
          <img src={config.logoUrl} alt="Logo" className="h-6 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 text-center">
        <h2 className="text-lg font-bold" style={{ color: config.textPrimaryColor ?? '#f8fafc' }}>
          {config.headingText || 'Welcome'}
        </h2>
        <p className="text-xs" style={{ color: config.textSecondaryColor ?? '#94a3b8' }}>
          {config.subheadingText || 'Connect to get started'}
        </p>

        {/* Mock form fields */}
        <div className="space-y-2">
          {['Phone number', 'Email (optional)'].map((placeholder) => (
            <div
              key={placeholder}
              className="rounded px-3 py-2 text-left text-xs"
              style={{
                backgroundColor: config.inputBgColor ?? '#1e293b',
                border: `1px solid ${config.borderColor ?? '#334155'}`,
                color: config.textSecondaryColor ?? '#94a3b8',
              }}
            >
              {placeholder}
            </div>
          ))}
        </div>

        <button
          className="w-full rounded py-2 text-xs font-semibold transition-colors"
          style={{
            backgroundColor: config.primaryColor ?? '#6366f1',
            color: config.buttonTextColor ?? '#ffffff',
          }}
        >
          {config.connectButtonText || 'Connect Now'}
        </button>

        <p className="text-[10px]" style={{ color: config.textSecondaryColor ?? '#94a3b8' }}>
          {config.termsText || 'By connecting, you agree to our Terms'}
        </p>
      </div>

      {/* Footer */}
      <div
        className="p-2 text-center text-[10px]"
        style={{ backgroundColor: config.footerBgColor ?? '#0f172a', color: config.textSecondaryColor ?? '#94a3b8', borderTop: `1px solid ${config.borderColor ?? '#334155'}` }}
      >
        {config.footerText || 'Powered by AuraConnect'}
      </div>
    </div>
  )
}
