
"use client";
import { useState, useRef, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { AuthService } from '@/lib/services/auth-service';
import { ConnectProvider, useConnect } from '@/components/home-page/ConnectContext';
import { env } from '@/env';

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


function VoucherInnerForm({ label = 'Connect Now', style, className }: BaseButtonProps) {
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
                        <input type="hidden" name="username" value={credentials.username} />
                        <input type="hidden" name="password" value={credentials.password} />
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

// Optional aliases for clarity (commented usage example)
// export { FreeLoginFormButton as FreeConnectButton, VoucherLoginForm as VoucherConnectForm };

// Usage example:
// <FreeLoginFormButton className="btn" style={{}} adGateEnabled />
// <VoucherLoginForm className="btn" style={{}} />