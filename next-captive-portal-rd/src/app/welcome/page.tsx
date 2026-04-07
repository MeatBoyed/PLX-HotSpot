"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { imageUrl } from "@/lib/image-url";
import AdSection from "@/components/ad-section";
import { Youtube, Instagram, Facebook } from "lucide-react";

function MarketingOptInCard() {
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
        <p className="font-bold text-base mb-1" style={{ color: theme.textPrimary }}>Unsubscribe</p>
        <p className="text-xs mb-3" style={{ color: theme.textPrimary }}>
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
            className="rounded-full px-6 py-2 text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
          >
            {submitting ? 'Processing...' : 'Unsubscribe'}
          </button>
        </form>
        <button onClick={() => { setMode('subscribe'); setEmail(''); }}
          className="text-xs mt-3 underline underline-offset-2" style={{ color: theme.textPrimary }}>
          Back to subscribe
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 shadow-lg" style={cardStyle}>
      <p className="font-bold text-base mb-1" style={{ color: theme.textPrimary }}>Stay in the loop</p>
      <p className="text-xs mb-3" style={{ color: theme.textPrimary }}>Get the latest news and offers from {theme.name}.</p>
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
          className="rounded-full px-6 py-2 text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
        >
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      <button onClick={() => { setMode('unsubscribe'); setEmail(''); }}
        className="text-xs mt-3 underline underline-offset-2" style={{ color: theme.textPrimary }}>
        Already subscribed? Unsubscribe
      </button>
    </div>
  );
}

function normalizeName(value: string | null | undefined) {
  if (!value) return "";
  const cleaned = decodeURIComponent(value).replace(/[_+]/g, " ").trim();
  return cleaned.split(/\s+/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

export default function WelcomePage() {
  const { theme } = useTheme();
  const [storedName, setStoredName] = useState("");

  const socialLinks = [
    { name: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
    { name: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  ];

  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem("pu-phonename-display") || "";
      setStoredName(normalizeName(fromStorage));
    } catch { setStoredName(""); }
  }, []);

  const displayName = useMemo(() => storedName || "Guest", [storedName]);

  return (
    <div className="relative flex flex-col items-center max-w-md w-full h-screen overflow-hidden"
      style={{ background: theme.brandPrimary }}>

      {/* Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
          style={{ background: theme.brandPrimaryHover, filter: 'blur(40px)', animationDuration: '3s' }} />
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full opacity-15 animate-pulse"
          style={{ background: theme.buttonPrimaryText, filter: 'blur(50px)', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: theme.brandAccent, filter: 'blur(60px)', animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top section — ultra compact */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 pt-4 pb-7">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full mb-3 w-full justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="bg-white rounded-full p-1.5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(theme.logo, theme.ssid)} alt="Brand logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: theme.textPrimary }}>{theme.name}</span>
          {/* <div className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: theme.brandAccent, color: '#fff' }}>
            Connected ✓
          </div> */}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight mb-0.5"
            style={{ color: theme.textPrimary, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            Welcome, {displayName}
          </h1>
          <p className="text-xs opacity-75" style={{ color: theme.textPrimary }}>to {theme.name}</p>
        </div>
      </div>

      {/* Wave */}
      <div className="relative z-10 w-full -mt-4">
        <svg viewBox="0 0 428 48" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="w-full" preserveAspectRatio="none" style={{ display: 'block', height: '40px' }}>
          <path d="M0 48 C80 10, 160 0, 214 20 C268 40, 348 50, 428 20 L428 48 Z" fill={theme.brandSecondary} />
        </svg>
      </div>

      {/* Bottom */}
      <div className="relative z-10 w-full flex-1 px-5 pb-4 pt-2 overflow-y-auto"
        style={{ background: theme.brandSecondary }}>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Enjoy Browsing</span>
          <div className="flex-1 h-px opacity-20" style={{ background: theme.textSecondary }} />
        </div>

        <div className="rounded-2xl p-3 mb-3 text-center shadow-lg"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            You are now connected to the internet. Enjoy your browsing experience!
          </p>
        </div>

        <p className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: theme.textSecondary }}>More of us</p>
        <div className="flex items-center justify-center gap-4 mb-3">
          {socialLinks.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.85)', color: theme.brandPrimary }}>
              <Icon size={20} />
            </a>
          ))}
        </div>

        {theme.marketingOptIn && <MarketingOptInCard />}

        <AdSection />
      </div>
    </div>
  );
}
