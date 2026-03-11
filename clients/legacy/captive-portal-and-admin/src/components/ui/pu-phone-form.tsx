"use client";
import { cn } from '@/lib/utils';
import { usePUPhoneFlow } from '@/lib/hooks/usePUPhoneFlow';
import { Input } from './input';
import { Label } from './label';
import { PhoneInput } from './phone-input';

type BaseButtonProps = {
    label?: string;
    className: string;
    style: React.CSSProperties;
    adGateEnabled?: boolean;
};

/** View component — pure presentation, delegates all logic to usePUPhoneFlow. */
export function PUPhoneInnerForm({ label = 'Connect with phone', style, className }: BaseButtonProps) {
    const {
        step, phone, name, otp, error, loading, displayName, resendCooldown, credentials,
        setPhone, setName, setOtp,
        onRequestOtp, onVerifyOtp, onResend, goBack,
        formRef, action,
    } = usePUPhoneFlow();

    return (
        <div className="inline-block w-full">
            {/* Returning user banner */}
            {displayName && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-3">
                    <strong>Welcome back, {displayName}!</strong>
                </div>
            )}

            {/* Step 1: Phone + Name form */}
            {step === 'form' && (
                <>
                    <div className="flex gap-3 flex-col w-full mb-2">
                        <Label>Phone</Label>
                        <PhoneInput
                            id="cell_display"
                            name="cell_display"
                            defaultCountry="ZA"
                            countries={["ZA"]}
                            international
                            countryCallingCodeEditable={false}
                            placeholder={"+27 82 123 4567"}
                            value={phone}
                            onChange={(v) => setPhone(typeof v === 'string' ? v : undefined)}
                            className="w-full border border-gray-500 rounded-lg disabled:opacity-60"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex gap-3 flex-col w-full mb-2">
                        <Label>Name</Label>
                        <Input
                            type="text"
                            className="w-full border border-gray-500 rounded p-2 mb-3 disabled:opacity-60"
                            placeholder="First Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {error && <p role="alert" aria-live="polite" className="text-xs text-red-500 mb-2">{error}</p>}
                    <button
                        onClick={onRequestOtp}
                        disabled={loading}
                        className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                        style={style}
                    >
                        {loading ? 'Sending code...' : 'Send Verification Code'}
                    </button>
                </>
            )}

            {/* Step 2: OTP verification */}
            {step === 'otp' && (
                <>
                    <p className="text-sm text-gray-600 mb-3">
                        A 4-digit code has been sent to <strong>{phone}</strong>
                    </p>
                    <div className="flex gap-3 flex-col w-full mb-2">
                        <Label>Verification Code</Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            className="w-full border border-gray-500 rounded p-2 mb-1 disabled:opacity-60 text-center text-lg tracking-widest"
                            placeholder="0000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                    {error && <p role="alert" aria-live="polite" className="text-xs text-red-500 mb-2">{error}</p>}

                    {/* Hidden form for MikroTik submission */}
                    <form ref={formRef} method="GET" action={action} className="inline-block w-full" onSubmit={onVerifyOtp}>
                        {credentials && (
                            <>
                                <input type="hidden" name="username" value={credentials.username.toLowerCase()} />
                                <input type="hidden" name="password" value={credentials.password.toLowerCase()} />
                            </>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(className, 'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed')}
                            style={style}
                        >
                            {loading ? 'Verifying...' : label}
                        </button>
                    </form>

                    <div className="flex justify-between items-center mt-3">
                        <button
                            type="button"
                            onClick={goBack}
                            className="text-sm text-gray-500 hover:underline"
                        >
                            &larr; Back
                        </button>
                        <button
                            type="button"
                            onClick={onResend}
                            disabled={resendCooldown > 0 || loading}
                            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
