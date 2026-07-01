'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  registerHref?: string;
}

export function LoginForm({ onSuccess, registerHref }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
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
          placeholder="Enter your password"
          disabled={submitting}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white text-gray-800 placeholder:text-gray-400"
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-full font-semibold text-sm bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer transition-opacity"
      >
        {submitting ? 'Logging in…' : 'Login'}
      </button>
      {registerHref && (
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href={registerHref} className="text-blue-600 hover:underline font-medium">
            Create one
          </Link>
        </p>
      )}
    </form>
  );
}
