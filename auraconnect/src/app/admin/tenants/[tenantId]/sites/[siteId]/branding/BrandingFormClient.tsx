'use client'

import { BrandingForm } from '@/components/branding/BrandingForm'
import { updateBrandingAction } from '@/lib/actions/branding.actions'
import type { BrandingConfig, UpdateBrandingInput } from '@/lib/types/branding.types'

interface Props {
  siteId: string
  config: BrandingConfig
  defaultBranding: BrandingConfig | null
}

export function BrandingFormClient({ siteId, config, defaultBranding }: Props) {
  const defaults: UpdateBrandingInput | undefined = defaultBranding
    ? (({ siteId: _s, updatedAt: _u, ...rest }) => rest)(defaultBranding)
    : undefined

  return (
    <BrandingForm
      siteId={siteId}
      config={config}
      onSave={(values) => updateBrandingAction(siteId, values).then(() => undefined)}
      defaultBranding={defaults}
    />
  )
}
