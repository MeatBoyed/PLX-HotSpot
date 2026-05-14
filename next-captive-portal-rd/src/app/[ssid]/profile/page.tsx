'use client';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;

  async function handleSignOut() {
    await logout();
    router.push(`/${ssid}/login`);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </div>

      <div className="px-5 pt-6 pb-24 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <p className="text-lg font-bold text-gray-900">{user.displayName}</p>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {user.status}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { label: 'Email', value: user.email },
            { label: 'First Name', value: user.firstName },
            { label: 'Last Name', value: user.lastName },
            { label: 'Phone', value: user.phoneNumber ?? '—' },
          ].map((row, i, arr) => (
            <div key={row.label}
              className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className="text-xs text-gray-400">{row.label}</span>
              <span className="text-sm font-medium text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-4 rounded-2xl font-bold text-base border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
