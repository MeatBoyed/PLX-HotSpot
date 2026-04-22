import Link from 'next/link';
import { ArrowRight, Palette, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const adminSections = [
    {
      title: 'Styles & Branding',
      description: 'Manage colors, typography, images, and overall brand appearance',
      href: '/admin/styles',
      icon: Palette,
    },
    {
      title: 'Packages',
      description: 'View and manage WiFi packages and pricing plans',
      href: '/admin/packages',
      icon: BarChart3,
    },
    {
      title: 'Marketing Opt-In',
      description: 'Configure and monitor marketing email subscriptions',
      href: '/admin/marketing-optin',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-slate-600">Welcome! Manage your hotspot configuration from here.</p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{section.title}</h2>
                  <p className="text-sm text-slate-600 mb-4">{section.description}</p>

                  {/* Arrow */}
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Visit Section
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats or Info */}
        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600">Current Environment</p>
              <p className="text-lg font-semibold text-slate-900">{process.env.NODE_ENV}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">API Version</p>
              <p className="text-lg font-semibold text-slate-900">v1.0</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-semibold text-green-600">● Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
