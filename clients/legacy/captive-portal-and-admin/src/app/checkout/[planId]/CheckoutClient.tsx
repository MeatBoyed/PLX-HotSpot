"use client";

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { PhoneInput } from '@/components/ui/phone-input';
import type { BuildState } from './actions';

export default function CheckoutClient({ planName, price, ssid, description, action }: {
    planName: string;
    price: number;
    ssid: string;
    description: string;
    action: (prevState: BuildState | undefined, formData: FormData) => Promise<BuildState>;
}) {
    const [phone, setPhone] = useState<string | undefined>(undefined); // E.164 (+2782...)
    const [state, formAction] = useFormState(action, undefined as unknown as BuildState);
    const ready = Boolean(state?.fields && state?.actionUrl);

    return (
        <div className="space-y-6 w-full">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Checkout – {planName}</h1>
                <p className="text-sm text-muted-foreground">Confirm your voucher purchase and proceed to secure PayFast payment.</p>
            </div>
            <div className="rounded border p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Plan</span><span>{planName}</span></div>
                <div className="flex justify-between text-sm"><span>Description: </span><span>{description}</span></div>
                <div className="flex justify-between text-sm font-semibold"><span>Price</span><span>R {price.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>SSID</span><span>{ssid}</span></div>
                {state?.displayMsisdn && (
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Cell</span><span>{state.displayMsisdn}</span></div>
                )}
            </div>

            {/* Phone capture form (outside PayFast form) */}
            <form action={formAction} className="space-y-4">
                {/* Hidden plan name field for the server action */}
                <input type="hidden" name="planName" value={planName} />

                <div>
                    <label htmlFor="cell_display" className="block text-sm font-medium mb-1">Mobile number (ZA)</label>
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
                        className="w-full"
                        disabled={ready}
                    />
                    {/* Hidden field actually posted to the server action */}
                    <input type="hidden" name="cell" value={phone || ''} />
                    {state?.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Only South African numbers are accepted.</p>
                </div>
                {!ready && (
                    <button type="submit" className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium">Continue</button>
                )}
            </form>

            {/* PayFast form (rendered only after server action responds with fields) */}
            {state?.fields && state?.actionUrl && (
                <form action={state.actionUrl} method="post" className="space-y-4">
                    {Object.entries(state.fields).map(([key, value]) => (
                        value !== '' ? (
                            <input key={key} type="hidden" name={key} value={value.trim()} />
                        ) : null
                    ))}
                    <button type="submit" className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium">Pay with PayFast</button>
                </form>
            )}
        </div>
    );
}
