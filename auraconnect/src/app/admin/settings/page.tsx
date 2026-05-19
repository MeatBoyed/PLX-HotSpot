import { Suspense } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SettingsClient } from './SettingsClient'
import { platformApi } from '@/lib/infrastructure/api/platform.api'

async function SettingsContent() {
  const settings = await platformApi.getSettings().catch(() => null)
  return <SettingsClient settings={settings} />
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Global configuration for the AuraConnect platform"
      />
      <Suspense fallback={<LoadingSkeleton.Form />}>
        <SettingsContent />
      </Suspense>
    </>
  )
}
