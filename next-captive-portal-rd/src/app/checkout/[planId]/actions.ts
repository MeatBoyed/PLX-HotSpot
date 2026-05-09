"use server";

import { env } from '@/env';
import { packagesService } from '@/application/services';
import { payFastService } from '@/features/purchasing/payfast-service';

export type BuildState = {
    error?: string;
    actionUrl?: string;
    fields?: Record<string, string>;
    displayMsisdn?: string;
};

export async function buildPayfastFieldsAction(_prevState: BuildState | undefined, formData: FormData): Promise<BuildState> {
    const planName = String(formData.get('planName') || '').trim();
    const ssid = String(formData.get('ssid') || '').trim();
    const rawCell = String(formData.get('cell') || '').trim();

    if (!planName) return { error: 'Missing plan.' };
    if (!ssid) return { error: 'Missing site configuration.' };
    if (!rawCell) return { error: 'Please enter your mobile number.' };

    // Normalize to 27XXXXXXXXX
    const digits = rawCell.replace(/\D/g, '');
    let normalizedMsisdn: string | null = null;
    if (/^27\d{9}$/.test(digits)) normalizedMsisdn = digits;
    else if (/^\d{9}$/.test(digits)) normalizedMsisdn = `27${digits}`;
    else if (/^0\d{9}$/.test(digits)) normalizedMsisdn = `27${digits.slice(1)}`;
    if (!normalizedMsisdn) return { error: 'Enter a valid ZA number (e.g. +2782XXXXXXX or 082XXXXXXX).' };

    const pkg = await packagesService.getByName(decodeURI(planName), ssid);
    if (!pkg) return { error: 'Selected package not found.' };

    const baseUrl = env.BASE_URL;
    const returnUrl = `${baseUrl}/checkout/success`;
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
