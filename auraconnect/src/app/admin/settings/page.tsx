import { PageHeader } from '@/components/common/PageHeader'
import { SettingsClient } from './SettingsClient'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Global configuration for the AuraConnect platform"
      />
      <SettingsClient />
    </>
  )
}
