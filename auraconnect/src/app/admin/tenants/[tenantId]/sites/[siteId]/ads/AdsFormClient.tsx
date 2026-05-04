'use client'

import { AdsConfigForm } from '@/components/ads/AdsConfigForm'
import { updateAdsConfigAction } from '@/lib/actions/ads.actions'
import type { AdsConfig } from '@/lib/types/ads.types'

export function AdsFormClient({ siteId, config }: { siteId: string; config: AdsConfig }) {
  return (
    <AdsConfigForm
      config={config}
      onSave={(values) => updateAdsConfigAction(siteId, values).then(() => undefined)}
    />
  )
}
