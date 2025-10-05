"use server";

import { env } from '@/env';
import { packageService } from '@/lib/services/package-service';
import { payFastService } from '@/features/purchasing/payfast-service';

export type BuildState = {
    error?: string;
    actionUrl?: string;
    fields?: Record<string, string>;
    displayMsisdn?: string;
};

export async function buildPayfastFieldsAction(_prevState: BuildState | undefined, formData: FormData): Promise<BuildState> {
    const planName = String(formData.get('planName') || '').trim();
    const rawCell = String(formData.get('cell') || '').trim();

    if (!planName) return { error: 'Missing plan.' };
    if (!rawCell) return { error: 'Please enter your mobile number.' };

    // Normalize to 27XXXXXXXXX
    const digits = rawCell.replace(/\D/g, '');
    let normalizedMsisdn: string | null = null;
    if (/^27\d{9}$/.test(digits)) normalizedMsisdn = digits;
    else if (/^\d{9}$/.test(digits)) normalizedMsisdn = `27${digits}`;
    else if (/^0\d{9}$/.test(digits)) normalizedMsisdn = `27${digits.slice(1)}`;
    if (!normalizedMsisdn) return { error: 'Enter a valid ZA number (e.g. +2782XXXXXXX or 082XXXXXXX).' };

    const pkg = await packageService.getByName(decodeURI(planName));
    if (!pkg) return { error: 'Selected package not found.' };

    const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/checkout/`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;
    const notifyUrl = `${baseUrl}/api/payfast/ipn`;

    // Ensure env is present; otherwise return error to display
    const { PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY } = env;
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
        const missing = [
            !PAYFAST_MERCHANT_ID && 'PAYFAST_MERCHANT_ID',
            !PAYFAST_MERCHANT_KEY && 'PAYFAST_MERCHANT_KEY',
        ].filter(Boolean).join(', ');
        return { error: `Configuration incomplete: ${missing}` };
    }

    const { actionUrl, fields } = payFastService.buildPaymentFields({
        pkg,
        returnUrl,
        cancelUrl,
        notifyUrl,
        cellNumber: normalizedMsisdn,
    });

    return {
        actionUrl,
        fields,
        displayMsisdn: `+${normalizedMsisdn}`,
    };
}
