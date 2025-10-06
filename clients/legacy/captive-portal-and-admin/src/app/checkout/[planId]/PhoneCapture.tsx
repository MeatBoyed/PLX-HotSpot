"use client";

import { useEffect, useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";

type Props = {
    rawCell?: string;
    cellError?: string | null;
};

export default function PhoneCapture({ rawCell, cellError }: Props) {
    const [value, setValue] = useState<string | undefined>(undefined);

    // Initialize from raw value if present
    useEffect(() => {
        const digits = (rawCell || "").replace(/\D/g, "");
        if (!digits) return;
        if (digits.startsWith("27") && digits.length === 11) setValue(`+${digits}`);
        else if (digits.length === 9) setValue(`+27${digits}`);
        else if (digits.length === 10 && digits.startsWith("0")) setValue(`+27${digits.slice(1)}`);
    }, [rawCell]);

    // Note: react-phone-number-input provides E.164 strings like +27821234567
    // We post that via a hidden input named "cell" so the server can normalize.
    return (
        <form method="get" className="space-y-4">
            <div>
                <label htmlFor="cell" className="block text-sm font-medium mb-1">Mobile number (ZA)</label>
                <div className="flex items-stretch gap-2">
                    <PhoneInput
                        name="cell_display"
                        id="cell_display"
                        defaultCountry="ZA"
                        countries={["ZA"]}
                        international
                        countryCallingCodeEditable={false}
                        placeholder="+27 82 123 4567"
                        value={value}
                        onChange={(v) => setValue(typeof v === 'string' ? v : undefined)}
                        className="w-full"
                    />
                </div>
                {/* Hidden input that actually posts under the expected name */}
                <input type="hidden" name="cell" value={value || ''} />
                {cellError && <p className="text-xs text-red-600 mt-1">{cellError}</p>}
                <p className="text-xs text-muted-foreground mt-1">Only South African numbers are accepted.</p>
            </div>
            <button type="submit" className="w-full rounded bg-primary text-primary-foreground py-2 text-sm font-medium">Continue</button>
        </form>
    );
}
