"use client";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

export default function MarketingOptInCard() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'subscribe' | 'unsubscribe'>('subscribe');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribeDone, setSubscribeDone] = useState(false);
  const [unsubscribeDone, setUnsubscribeDone] = useState(false);

  const cardStyle = { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' };

  const onSubscribe = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!agreed || !email.trim()) return;
    setSubmitting(true);
    try {
      const { toast } = await import('sonner');
      const res = await fetch('/api/marketing-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), ssid: theme.ssid }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("You're subscribed!");
        setSubscribeDone(true);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      const { toast } = await import('sonner');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onUnsubscribe = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { toast } = await import('sonner');
      const res = await fetch('/api/marketing-optin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), ssid: theme.ssid }),
      });
      const data = await res.json();
      if (data.success || data.alreadyUnsubscribed) {
        toast.success("You've been unsubscribed.");
        setUnsubscribeDone(true);
      } else if (data.error === 'Email not found') {
        toast.error('That email is not subscribed on this portal.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      const { toast } = await import('sonner');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribeDone) {
    return (
      <div className="rounded-2xl p-4 text-center shadow-lg" style={cardStyle}>
        <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>You&apos;re subscribed!</p>
        <p className="text-xs mt-1" style={{ color: theme.textPrimary }}>We&apos;ll keep you in the loop.</p>
        <button onClick={() => { setMode('unsubscribe'); setSubscribeDone(false); setEmail(''); }}
          className="text-xs mt-3 underline underline-offset-2" style={{ color: theme.textPrimary }}>
          Unsubscribe instead
        </button>
      </div>
    );
  }

  if (unsubscribeDone) {
    return (
      <div className="rounded-2xl p-4 text-center shadow-lg" style={cardStyle}>
        <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>You&apos;ve been unsubscribed.</p>
        <p className="text-xs mt-1" style={{ color: theme.textPrimary }}>You won&apos;t receive further marketing emails.</p>
        <button onClick={() => { setMode('subscribe'); setUnsubscribeDone(false); setEmail(''); setAgreed(false); }}
          className="text-xs mt-3 underline underline-offset-2" style={{ color: theme.textPrimary }}>
          Re-subscribe
        </button>
      </div>
    );
  }

  if (mode === 'unsubscribe') {
    return (
      <div className="rounded-2xl p-4 shadow-lg" style={cardStyle}>
        <p className="font-bold text-sm mb-1" style={{ color: theme.textPrimary }}>Unsubscribe</p>
        <p className="text-xs mb-2" style={{ color: theme.textPrimary }}>
          Enter your email to stop receiving marketing communications from {theme.name}.
        </p>
        <form onSubmit={onUnsubscribe} className="flex flex-col gap-2">
          <input
            type="email"
            required
            placeholder="Enter your subscribed email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="w-full border border-gray-300 rounded p-2 text-sm disabled:opacity-60 bg-white text-gray-800 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
          >
            {submitting ? 'Processing...' : 'Unsubscribe'}
          </button>
        </form>
        <button onClick={() => { setMode('subscribe'); setEmail(''); }}
          className="text-xs mt-2 underline underline-offset-2" style={{ color: theme.textPrimary }}>
          Back to subscribe
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 shadow-lg" style={cardStyle}>
      <p className="font-bold text-sm mb-1" style={{ color: theme.textPrimary }}>Stay in the loop</p>
      <p className="text-xs mb-2" style={{ color: theme.textPrimary }}>Get the latest news and offers from {theme.name}.</p>
      <form onSubmit={onSubscribe} className="flex flex-col gap-2">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="w-full border border-gray-300 rounded p-2 text-sm disabled:opacity-60 bg-white text-gray-800 placeholder:text-gray-400"
        />
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={submitting}
            className="mt-0.5 shrink-0"
          />
          <span className="text-xs" style={{ color: theme.textPrimary }}>
            I agree to receive marketing communications
          </span>
        </label>
        <button
          type="submit"
          disabled={submitting || !agreed || !email.trim()}
          className="rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
        >
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      <button onClick={() => { setMode('unsubscribe'); setEmail(''); }}
        className="text-xs mt-2 underline underline-offset-2" style={{ color: theme.textPrimary }}>
        Already subscribed? Unsubscribe
      </button>
    </div>
  );
}
