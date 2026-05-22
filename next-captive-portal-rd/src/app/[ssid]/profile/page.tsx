'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import PoweredByFooter from '@/components/PoweredByFooter';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ssid = params.ssid as string;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  function openEdit() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phoneNumber ?? '');
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        email: email.trim() || null,
        // Send "" to clear phone, null to leave unchanged
        phoneNumber: phone.trim() === '' && user.phoneNumber ? '' : phone.trim() || null,
      });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await logout();
    router.push(`/${ssid}/login`);
  }

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md">
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
        {!editing && (
          <button onClick={openEdit} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Edit
          </button>
        )}
      </div>

      <div className="px-5 pt-6 pb-24 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
            {initials}
          </div>
          <p className="text-lg font-bold text-gray-900">{user.displayName}</p>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {user.status}
          </span>
        </div>

        {editing ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {[
              { label: 'First Name', value: firstName, onChange: setFirstName },
              { label: 'Last Name',  value: lastName,  onChange: setLastName },
              { label: 'Email',      value: email,      onChange: setEmail, type: 'email' },
              { label: 'Phone',      value: phone,      onChange: setPhone, type: 'tel', placeholder: 'e.g. 0821234567' },
            ].map(({ label, value, onChange, type = 'text', placeholder }) => (
              <div key={label} className="flex items-center px-4 py-3 gap-3">
                <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
                <input
                  type={type}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 text-sm text-gray-800 bg-transparent outline-none border-b border-gray-200 focus:border-blue-400 py-0.5 transition-colors"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {[
              { label: 'First Name', value: user.firstName },
              { label: 'Last Name',  value: user.lastName },
              { label: 'Email',      value: user.email },
              { label: 'Phone',      value: user.phoneNumber ?? '—' },
            ].map((row, i, arr) => (
              <div key={row.label}
                className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className="text-xs text-gray-400">{row.label}</span>
                <span className="text-sm font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <>
            {saveError && <p className="text-xs text-red-500 text-center">{saveError}</p>}
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}

        {!editing && (
          <button
            onClick={handleSignOut}
            className="w-full py-4 rounded-2xl font-bold text-base border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        )}
        <PoweredByFooter />
      </div>
    </div>
  );
}
