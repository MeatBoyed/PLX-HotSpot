import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { tenantService } from '@/lib/services/tenant.service'
import { siteService } from '@/lib/services/site.service'

interface AdminLayoutProps {
  children: React.ReactNode
  params?: Promise<{ tenantId?: string; siteId?: string }>
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [tenants, sites] = await Promise.all([
    tenantService.getAll(),
    siteService.getAll(),
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header tenants={tenants} sites={sites} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
