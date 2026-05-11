"use client"
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/AuthContext";
import { imageUrl } from "@/lib/image-url";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    const handleAccept = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checked) return;
        // If authenticated, go straight to the connect page.
        // If not (or auth check still loading), send to login —
        // the login page will auto-redirect if a valid session is found.
        if (user) {
            router.push(`/${theme.ssid}/`);
        } else {
            router.push(`/${theme.ssid}/login`);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden" style={{ maxWidth: '430px' }}>

            {/* Full bleed background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={imageUrl(theme.splashBackground, theme.ssid)}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.80)' }}
                />
                {/* Cinematic gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,0.15) 0%,
                            rgba(0,0,0,0.05) 50%,
                            ${theme.brandPrimary}99 70%,
                            ${theme.brandPrimary} 100%
                        )`
                    }}
                />
                {/* Subtle diagonal color stripe */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(
                            135deg,
                            ${theme.brandAccent}22 50%,
                            transparent 65%
                        )`
                    }}
                />
            </div>

            {/* Top — Logo + venue badge */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-6 pt-10">
                <div className="relative flex items-center justify-center">
                    <div className="absolute rounded-full animate-ping"
                        style={{ width: '64px', height: '64px', background: `${theme.brandPrimary}33`, animationDuration: '2s' }}
                    />
                    <div className="absolute rounded-full animate-ping"
                        style={{ width: '80px', height: '80px', background: `${theme.brandPrimary}1A`, animationDuration: '2s', animationDelay: '0.4s' }}
                    />
                    <div className="relative z-10 rounded-2xl p-2 shadow-2xl"
                        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl(theme.logo, theme.ssid)} alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                </div>
                <div className="px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', color: theme.textPrimary }}>
                    Free WiFi
                </div>
            </div>

            {/* Middle — Venue name */}
            <div className="absolute z-20 px-6" style={{ top: '35%' }}>
                {/* <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: theme.textSecondary }}>
                    {theme.name}
                </p> */}
                <h2 className="text-3xl font-black leading-none mb-3"
                    style={{ color: theme.textSecondary, textShadow: '0 4px 30px rgba(0,0,0,0.4)', letterSpacing: '-0.02em' }}>
                    {theme.splashHeading || 'Welcome to\nthe Hotspot'}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                    <div className="h-px w-8" style={{ background: theme.brandAccent }} />
                    <div className="h-px flex-1 opacity-30" style={{ background: theme.textMuted }} />
                </div>
            </div>

            {/* Bottom — Glass acceptance card */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-3"
                style={{ background: `linear-gradient(to top, ${theme.brandAccent} 1%, transparent)` }}>
                <form onSubmit={handleAccept}>

                    {/* Terms checkbox */}
                    <label className="flex items-start gap-3 mb-5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="sr-only"
                            required
                        />
                        <div className="mt-0.5 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200 shadow-md"
                            style={{
                                background: checked ? theme.brandAccent : 'rgba(255,255,255,0.15)',
                                border: `2px solid ${checked ? theme.brandAccent : 'rgba(255,255,255,0.4)'}`,
                                backdropFilter: 'blur(8px)',
                            }}>
                            {checked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>
                            I agree to the{' '}
                            <Link href="/terms-and-conditions"
                                style={{ color: theme.textPrimary, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                                terms and conditions
                            </Link>{' '}
                            for use of this service.
                        </span>
                    </label>

                    {/* Accept button */}
                    <button
                        type="submit"
                        disabled={!checked}
                        className="relative w-full rounded-2xl text-base font-bold py-4 flex items-center justify-center gap-3 overflow-hidden transition-all duration-300"
                        style={{
                            background: theme.buttonPrimary,
                            color: theme.buttonPrimaryText,
                            backdropFilter: 'blur(8px)',
                            border: '1px solid transparent',
                            boxShadow: checked ? `0 8px 32px ${theme.buttonPrimary}66` : 'none',
                            opacity: checked ? 1 : 0.45,
                            cursor: checked ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {checked && (
                            <div className="absolute inset-0 opacity-20"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'shimmer 2s infinite' }}
                            />
                        )}
                        <span className="relative z-10 tracking-wide">Accept &amp; Connect</span>
                        <span className="relative z-10 text-xl">→</span>
                    </button>

                    {/* <p className="text-center text-xs mt-4" style={{ color: theme.textSecondary }}>
                        Powered by <span style={{ color: theme.textSecondary, fontWeight: 600 }}>Vega Vision</span>
                    </p> */}
                </form>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
