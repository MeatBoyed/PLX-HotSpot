'use client'

import { BrandingForm } from '@/components/branding/BrandingForm'
import { updateBrandingAction } from '@/lib/actions/branding.actions'
import type { BrandingConfig } from '@/lib/types/branding.types'

interface Props {
  siteId: string
  config: BrandingConfig
}

export function BrandingFormClient({ siteId, config }: Props) {
  return (
    <BrandingForm
      config={config}
      onSave={(values) => updateBrandingAction(siteId, values).then(() => undefined)}
    />
  )
}
