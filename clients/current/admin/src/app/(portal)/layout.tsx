import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AuraConnect WiFi',
  description: 'Connect to WiFi',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  )
}
