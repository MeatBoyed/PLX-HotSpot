'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface RegisterFormProps {
  onSuccess?: () => void;
  loginHref?: string;
}

export function RegisterForm({ onSuccess, loginHref }: RegisterFormProps) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !trimmedPassword) {
      setError('First name, last name, email and password are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const { toast } = await import('sonner');
    try {
      await register({
        email: trimmedEmail,
        password: trimmedPassword,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phoneNumber: phoneNumber.trim() || null,
      });
      toast.success('Account created!');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 w-full">
          <Label>First name</Label>
          <Input
            type="text"
            placeholder="First name"
            disabled={submitting}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white text-gray-800 placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <Label>Last name</Label>
          <Input
            type="text"
            placeholder="Last name"
            disabled={submitting}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-white text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Enter your email"
          disabled={submitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white text-gray-800 placeholder:text-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="Password (min 6 characters)"
          disabled={submitting}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white text-gray-800 placeholder:text-gray-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          type="tel"
          placeholder="+27 ..."
          disabled={submitting}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-white text-gray-800 placeholder:text-gray-400"
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-full font-semibold text-sm bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer transition-opacity"
      >
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
      {loginHref && (
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href={loginHref} className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      )}
    </form>
  );
}
