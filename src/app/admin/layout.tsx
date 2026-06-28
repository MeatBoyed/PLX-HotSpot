import { AdminNavbar } from './admin-navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AdminNavbar />
            <main className="min-h-screen bg-gray-50">
                {children}
            </main>
        </>
    );
}
