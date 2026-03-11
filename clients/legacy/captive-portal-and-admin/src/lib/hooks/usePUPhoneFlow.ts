"use client";
import { useState, useRef, FormEvent, useEffect } from 'react';
import { AuthService } from '@/lib/services/auth-service';
import { useConnect } from '@/components/home-page/ConnectContext';

type Step = 'form' | 'otp';

function useProgrammaticSubmit() {
    const formRef = useRef<HTMLFormElement | null>(null);
    const submit = () => formRef.current?.submit();
    return { formRef, submit };
}

/** Controller hook — owns all state and side-effects for the PU-PhoneName OTP flow. */
export function usePUPhoneFlow() {
    const { connect, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const action = new AuthService().getLoginFormTarget();

    // Step state
    const [step, setStep] = useState<Step>('form');

    // Form fields
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');

    // UI state
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);

    // Resend cooldown
    const [resendCooldown, setResendCooldown] = useState(0);

    // Tick down resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Pull stored display name when creds appear (returning user auto-login)
    useEffect(() => {
        if (credentials && credentials.mode === 'pu-phonename') {
            try {
                const stored = localStorage.getItem('pu-phonename-display');
                if (stored) {
                    setDisplayName(stored);
                    setPhone("+" + credentials.username.replace(/^jt_/, ''));
                    setName(credentials.password.replace(/_/g, ' '));
                }
            } catch { }
        }
    }, [credentials]);

    // Step 1: Request OTP
    const onRequestOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedPhone = phone?.trim();
        const trimmedName = name?.trim();
        if (!trimmedPhone || !trimmedName) {
            setError('Phone and name are required');
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch('/api/pu-phonename/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: trimmedPhone, name: trimmedName }),
            });
            const data = await resp.json();
            if (!data.success) {
                setError(data.error || 'Failed to send verification code');
                return;
            }
            setStep('otp');
            setResendCooldown(30);
        } catch (err) {
            console.error('[PU-PHONE] send-otp error', err);
            setError('Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and login
    const onVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedOtp = otp.trim();
        if (!trimmedOtp) {
            setError('Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch('/api/pu-phonename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone?.trim(), name: name?.trim(), otp: trimmedOtp }),
            });
            const data = await resp.json();
            if (!data.success) {
                setError(data.error || 'Verification failed');
                return;
            }
            // Build credentials and submit to MikroTik
            const result = connect(undefined, { username: data.username, password: data.password, mode: 'pu-phonename' });
            if (!result.pending) {
                if ('error' in result) {
                    setError(result.error);
                } else if ('credentials' in result) {
                    try {
                        localStorage.setItem('pu-phonename-display', name?.trim() || '');
                    } catch { }
                    setTimeout(() => submit(), 0);
                }
            }
        } catch (err) {
            console.error('[PU-PHONE] verify error', err);
            setError('Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const onResend = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        setLoading(true);
        try {
            const resp = await fetch('/api/pu-phonename/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone?.trim(), name: name?.trim() }),
            });
            const data = await resp.json();
            if (!data.success) {
                setError(data.error || 'Failed to resend code');
                return;
            }
            setOtp('');
            setResendCooldown(30);
        } catch (err) {
            console.error('[PU-PHONE] resend error', err);
            setError('Unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => { setStep('form'); setError(null); setOtp(''); };

    return {
        // state
        step, phone, name, otp, error, loading, displayName, resendCooldown, credentials,
        // setters (for view bindings)
        setPhone, setName, setOtp,
        // actions
        onRequestOtp, onVerifyOtp, onResend, goBack,
        // form plumbing
        formRef, action,
    };
}
