import { env } from '@/env';

export type AuthMode = 'free' | 'voucher';

export interface AuthCredentials {
    username: string;
    password: string;
    mode: AuthMode;
    voucherCode?: string;
}

export interface BuildCredentialsParams {
    voucherCode?: string;
    enabledAuth: AuthMode[];
}

export type AuthCredentialsResult =
    | { ok: true; credentials: AuthCredentials }
    | { ok: false; error: string };

function has(list: AuthMode[], mode: AuthMode) {
    return list.includes(mode);
}

export class AuthService {
    private defaultUser: string;
    private defaultPass: string;
    private baseUrl: string;

    constructor() {
        this.defaultUser = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_USERNAME || 'freeuser';
        this.defaultPass = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD || 'freepass';
        const raw = env.NEXT_PUBLIC_MIKROTIK_BASE_URL || 'http://10.5.50.1';
        this.baseUrl = raw.endsWith('/login') ? raw : `${raw.replace(/\/$/, '')}/login`;
    }

    getLoginFormTarget(): string {
        return this.baseUrl;
    }

    buildCredentials(params: BuildCredentialsParams): AuthCredentialsResult {
        const { voucherCode, enabledAuth } = params;

        // Voucher flow
        if (voucherCode !== undefined && voucherCode !== '') {
            if (!has(enabledAuth, 'voucher')) {
                return { ok: false, error: 'Voucher authentication not enabled' };
            }
            const trimmed = voucherCode.trim();
            if (!trimmed) {
                return { ok: false, error: 'Voucher code required' };
            }
            return {
                ok: true,
                credentials: {
                    username: trimmed,
                    password: trimmed,
                    mode: 'voucher',
                    voucherCode: trimmed,
                },
            };
        }

        // Free flow
        if (!has(enabledAuth, 'free')) {
            return { ok: false, error: 'Free authentication not enabled' };
        }
        return {
            ok: true,
            credentials: {
                username: this.defaultUser,
                password: this.defaultPass,
                mode: 'free',
            },
        };
    }
}
