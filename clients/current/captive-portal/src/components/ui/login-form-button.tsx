"use client";
import { useState, useRef, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { AuthService } from '@/lib/services/auth-service';
import { ConnectProvider, useConnect } from '@/components/home-page/ConnectContext';
import { Input } from './input';
import { Label } from './label';
import Link from 'next/link';
import { PUPhoneInnerForm } from './pu-phone-form';
import type { GatewayConfig } from '@/lib/types';

// ─── Network Auth ────────────────────────────────────────────────────────────
// All forms below submit credentials to the Mikrotik/RadiusDesk gateway.
// They are NOT platform auth — they grant network access only.

type NetworkFormProps = {
    label?: string;
    className: string;
    style: React.CSSProperties;
    adGateEnabled?: boolean;
    gatewayConfig: GatewayConfig;
};

function useProgrammaticSubmit() {
    const formRef = useRef<HTMLFormElement | null>(null);
    const submit = () => formRef.current?.submit();
    return { formRef, submit };
}

function NetworkFreeInner({ label = 'Connect Now', style, className, gatewayConfig }: NetworkFormProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [attempted, setAttempted] = useState(false);
    const action = new AuthService(gatewayConfig).getLoginFormTarget();

    const onClick = (e: FormEvent) => {
        e.preventDefault();
        const result = connect();
        setAttempted(true);
        if (!result.pending && 'credentials' in result) {
            setTimeout(() => submit(), 0);
        }
    };

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
            {attempted && state === 'ready' && !credentials && (
                <p className="mt-1 text-xs text-gray-500">Click again to submit.</p>
            )}
        </form>
    );
}

function NetworkVoucherInner({ label = 'Connect Now', style, className, gatewayConfig }: NetworkFormProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [voucherCode, setVoucherCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const action = new AuthService(gatewayConfig).getLoginFormTarget();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = voucherCode.trim();
        if (!trimmed) { setError('Voucher code required'); return; }
        const result = connect(trimmed);
        if (!result.pending) {
            if ('error' in result) setError(result.error);
            else if ('credentials' in result) setTimeout(() => submit(), 0);
        }
    };

    const disabled = showAd || state === 'ad';

    return (
        <div className="inline-block w-full">
            <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 mb-3 disabled:opacity-60 bg-white text-gray-800 placeholder:text-gray-400"
                placeholder="Enter your Wifi Code to connect"
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

function NetworkLoginInner({ label = 'Login to Connect', style, className, gatewayConfig }: NetworkFormProps) {
    const { connect, state, showAd, credentials } = useConnect();
    const { formRef, submit } = useProgrammaticSubmit();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const action = new AuthService(gatewayConfig).getLoginFormTarget();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        if (!trimmedEmail || !trimmedPassword) { setError('Email & Password are required'); return; }
        const result = connect(undefined, { username: trimmedEmail, password: trimmedPassword, mode: 'pu-login' });
        if (!result.pending) {
            if ('error' in result) setError(result.error);
            else if ('credentials' in result) setTimeout(() => submit(), 0);
        }
    };

    const disabled = showAd || state === 'ad';

    return (
        <div className="inline-block w-full">
            <div className="flex gap-3 flex-col w-full mb-2">
                <Label>Email</Label>
                <Input
                    type="email"
                    className="w-full border border-gray-300 rounded p-2 mb-3 disabled:opacity-60 bg-white text-gray-800 placeholder:text-gray-400"
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
                    className="w-full border border-gray-300 rounded p-2 mb-3 disabled:opacity-60 bg-white text-gray-800 placeholder:text-gray-400"
                    placeholder="Enter your password"
                    disabled={disabled}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex gap-2 justify-center items-center">
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

// ─── Exported Network Auth Components ────────────────────────────────────────

export function NetworkFreeConnectButton(props: NetworkFormProps) {
    return (
        <ConnectProvider enabledAuth={['free']} gatewayConfig={props.gatewayConfig} adGateEnabled={props.adGateEnabled}>
            <NetworkFreeInner {...props} />
        </ConnectProvider>
    );
}

export function NetworkVoucherConnectForm(props: NetworkFormProps) {
    return (
        <ConnectProvider enabledAuth={['voucher']} gatewayConfig={props.gatewayConfig} adGateEnabled={props.adGateEnabled}>
            <NetworkVoucherInner {...props} />
        </ConnectProvider>
    );
}

export function NetworkLoginForm(props: NetworkFormProps) {
    return (
        <ConnectProvider enabledAuth={['pu-login']} gatewayConfig={props.gatewayConfig} adGateEnabled={props.adGateEnabled}>
            <NetworkLoginInner {...props} />
        </ConnectProvider>
    );
}

export function NetworkPhoneNameForm(props: NetworkFormProps) {
    return (
        <ConnectProvider enabledAuth={['pu-phonename']} gatewayConfig={props.gatewayConfig} adGateEnabled={props.adGateEnabled}>
            <PUPhoneInnerForm {...props} />
        </ConnectProvider>
    );
}
