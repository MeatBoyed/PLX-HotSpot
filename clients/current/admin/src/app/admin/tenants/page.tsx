import { tenantService } from '@/lib/services/tenant.service'
import { TenantsPageClient } from './TenantsPageClient'

export default async function TenantsPage() {
  const tenants = await tenantService.getAll()
  return <TenantsPageClient initialTenants={tenants} />
}
