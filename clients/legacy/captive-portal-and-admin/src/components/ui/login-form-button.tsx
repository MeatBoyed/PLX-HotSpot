
"use client";
import { useState, useRef, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { AuthService } from '@/lib/services/auth-service';
import { ConnectProvider, useConnect } from '@/components/home-page/ConnectContext';
import { Input } from './input';
import { FormLabel } from './form';
import { Label } from './label';
import Link from 'next/link';
import { Dot } from 'lucide-react';
// (env import removed - not used)

type BaseButtonProps = {
    label?: string;
    className: string;
    style: React.CSSProperties;
    adGateEnabled?: boolean;
};

// Internal hook to provide programmatic submission logic
function useProgrammaticSubmit() {
    const formRef = useRef<HTMLFormElement | null>(null);
    const submit = () => formRef.current?.submit();
    return { formRef, submit };
}

/**
 * Static login form button that posts hidden credentials to the Mikrotik login endpoint.
 * - No JS handlers (pure <form> submit)
 * - Username/password (and optional dst) sent as hidden inputs
 * - Action targets `${MIKROTIK_BASE_URL}/login` using POST
 */
function FreeInnerButton({ label = 'Connect Now', style, className }: BaseButtonProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [attempted, setAttempted] = useState(false);
    const action = new AuthService().getLoginFormTarget();

    const onClick = (e: FormEvent) => {
        e.preventDefault();
        const result = connect();
        setAttempted(true);
        if (!result.pending && 'credentials' in result) {
            // React hasn't flushed the new hidden inputs yet; defer submit
            setTimeout(() => submit(), 0);
        }
    };

    // If credentials become available after ad gate, require second click (simple MVP)
    const disabled = showAd || state === 'ad';

    return (
        <form ref={formRef} method="GET" action={action} className="inline-block w-full">
            {credentials && (
                <>
                    <input type="hidden" name="username" value={credentials.username} />
                    <input type="hidden" name="password" value={credentials.password} />
                </>
            )}
            <button
                onClick={onClick}
                aria-disabled={disabled}
                disabled={disabled}
                type="submit"
                className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                style={style}
            >
                {disabled ? (showAd ? 'Watch Ad…' : label) : label}
            </button>
            {/* Optionally show hint after ad finished but before second click */}
            {attempted && state === 'ready' && !credentials && (
                <p className="mt-1 text-xs text-gray-500">Click again to submit.</p>
            )}
        </form>
    );
}

// PU Login Inner Form
function PULoginInnerForm({ label = 'Login to Connect', style, className }: BaseButtonProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const action = new AuthService().getLoginFormTarget();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim()
        if (!trimmedEmail || !trimmedPassword) {
            setError('Email & Password are required');
            return;
        }
        const result = connect(undefined, { username: trimmedEmail, password: trimmedPassword, mode: 'pu-login' });
        if (!result.pending) {
            if ('error' in result) {
                setError(result.error);
            } else if ('credentials' in result) {
                // Defer so hidden inputs update with credentials before submit
                setTimeout(() => submit(), 0);
            }
        }
    };

    const disabled = showAd || state === 'ad';

    return (
        <div className="inline-block w-full">
            <div className="flex gap-3 flex-col w-full mb-2">
                <Label>Email</Label>
                <Input
                    type="email"
                    className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                    placeholder="Enter your email"
                    disabled={disabled}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex gap-3 flex-col w-full mb-2">
                <Label>Password</Label>
                <Input
                    type="password"
                    className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                    placeholder="Enter your Password code"
                    disabled={disabled}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className='flex gap-2 justify-center items-center'>
                <Link href="/register" className="text-sm text-blue-600 hover:underline">
                    Register an account
                </Link>

            </div>
            {error && <p role="alert" aria-live="polite" className="text-xs text-red-500 mb-2">{error}</p>}
            <form ref={formRef} method="GET" action={action} className="inline-block w-full" onSubmit={onSubmit}>
                {credentials && (
                    <>
                        <input type="hidden" name="username" value={credentials.username.toLowerCase()} />
                        <input type="hidden" name="password" value={credentials.password.toLowerCase()} />
                    </>
                )}
                <button
                    type="submit"
                    aria-disabled={disabled}
                    disabled={disabled}
                    className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                    style={style}
                >
                    {disabled ? (showAd ? 'Watch Ad…' : label) : label}
                </button>
            </form>
        </div>
    );
}

// PU Register Inner Form
function PURegisterInnerForm({ label = 'Register to Connect', style, className }: BaseButtonProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Email & Password are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsRegistering(true);

        try {
            const { toast } = await import('sonner');

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Account created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                toast.error(result.error || 'Registration failed. Please try again.');
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('[REGISTER] Client error:', err);
            const { toast } = await import('sonner');
            toast.error('An unexpected error occurred. Please try again.');
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="inline-block w-full">
            <div className="flex gap-3 flex-col w-full mb-2">
                <Label>Email</Label>
                <Input
                    type="email"
                    className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                    placeholder="Enter your email"
                    disabled={isRegistering}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex gap-3 flex-col w-full mb-2">
                <Label>Password</Label>
                <Input
                    type="password"
                    className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                    placeholder="Enter your Password (min 6 characters)"
                    disabled={isRegistering}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className='flex gap-2 justify-center items-center'>
                <Link href="/" className="text-sm text-blue-600 hover:underline">
                    Already have an account? Login
                </Link>
            </div>
            {error && <p role="alert" aria-live="polite" className="text-xs text-red-500 mb-2">{error}</p>}
            <button
                onClick={onSubmit}
                aria-disabled={isRegistering}
                disabled={isRegistering}
                className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                style={style}
            >
                {isRegistering ? 'Creating account...' : label}
            </button>
        </div>
    );
} function VoucherInnerForm({ label = 'Connect Now', style, className }: BaseButtonProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [voucherCode, setVoucherCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const action = new AuthService().getLoginFormTarget();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = voucherCode.trim();
        if (!trimmed) {
            setError('Voucher code required');
            return;
        }
        const result = connect(trimmed);
        if (!result.pending) {
            if ('error' in result) {
                setError(result.error);
            } else if ('credentials' in result) {
                // Defer so hidden inputs update with credentials before submit
                setTimeout(() => submit(), 0);
            }
        }
    };

    const disabled = showAd || state === 'ad';

    return (
        <div className="inline-block w-full">
            <input
                type="text"
                className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                placeholder="Enter your voucher code"
                disabled={disabled}
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
            />
            {error && <p role="alert" aria-live="polite" className="text-xs text-red-500 mb-2">{error}</p>}
            <form ref={formRef} method="GET" action={action} className="inline-block w-full" onSubmit={onSubmit}>
                {credentials && (
                    <>
                        <input type="hidden" name="username" value={credentials.username.toLowerCase()} />
                        <input type="hidden" name="password" value={credentials.password.toLowerCase()} />
                    </>
                )}
                <button
                    type="submit"
                    aria-disabled={disabled}
                    disabled={disabled}
                    className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                    style={style}
                >
                    {disabled ? (showAd ? 'Watch Ad…' : label) : label}
                </button>
            </form>
        </div>
    );
}

// Public exported components embedding their own provider
export function FreeLoginFormButton(props: BaseButtonProps) {
    return (
        <ConnectProvider enabledAuth={['free']} adGateEnabled={props.adGateEnabled}>
            <FreeInnerButton {...props} />
        </ConnectProvider>
    );
}

export function VoucherLoginForm(props: BaseButtonProps) {
    return (
        <ConnectProvider enabledAuth={['voucher']} adGateEnabled={props.adGateEnabled}>
            <VoucherInnerForm {...props} />
        </ConnectProvider>
    );
}

export function PULoginForm(props: BaseButtonProps) {
    return (
        <ConnectProvider enabledAuth={['pu-login']} adGateEnabled={props.adGateEnabled}>
            <PULoginInnerForm {...props} />
        </ConnectProvider>
    );
}

export function PURegisterForm(props: BaseButtonProps) {
    return (
        <ConnectProvider enabledAuth={['pu-login']} adGateEnabled={props.adGateEnabled}>
            <PURegisterInnerForm {...props} />
        </ConnectProvider>
    );
}

// Optional aliases for clarity (commented usage example)
// export { FreeLoginFormButton as FreeConnectButton, VoucherLoginForm as VoucherConnectForm };

// Usage example:
// <FreeLoginFormButton className="btn" style={{}} adGateEnabled />
// <VoucherLoginForm className="btn" style={{}} />