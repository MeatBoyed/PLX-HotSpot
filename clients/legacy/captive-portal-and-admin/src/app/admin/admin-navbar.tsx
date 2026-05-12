'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function AdminNavbar() {
    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <h1 className="text-lg font-semibold text-gray-900">AuraConnect Admin</h1>
                    {/* <div className="flex gap-6 text-sm">
                        <Link 
                            href="/admin/brandconfig" 
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            Branding
                        </Link>
                        <Link 
                            href="/admin/packages" 
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            Packages
                        </Link>
                        <Link 
                            href="/admin/marketing-optin" 
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            Marketing
                        </Link>
                    </div> */}
                </div>

                <UserButton
                    // afterSignOutUrl="/sign-in"
                    appearance={{
                        elements: {
                            avatarBox: "w-15 h-15"
                        }
                    }}
                />
            </div>
        </nav>
    );
}
