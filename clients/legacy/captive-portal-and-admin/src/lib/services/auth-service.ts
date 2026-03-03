import { env } from '@/env';

export type AuthMode = 'free' | 'voucher' | 'pu-login' | 'pu-phonename';

export interface AuthCredentials {
    username: string;
    password: string;
    mode: AuthMode;
    voucherCode?: string;
}

export interface BuildCredentialsParams {
    voucherCode?: string;
    username?: string
    password?: string;
    enabledAuth: AuthMode[];
    mode?: AuthMode; // specify which auth method we're trying to build credentials for
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
        const { voucherCode, username, password, enabledAuth } = params;

        // Username/password supplied explicitly (typically from a form)
        if (params.username !== undefined && params.password !== undefined) {
            const mode = params.mode;
            // Only permanent user flows support arbitrary username/password
            if (mode === 'pu-login' || mode === 'pu-phonename') {
                if (!has(enabledAuth, mode)) {
                    return { ok: false, error: `Authentication mode '${mode}' not enabled` };
                }
                const trimmedUser = params.username.trim();
                const trimmedPass = params.password.trim();
                if (!trimmedUser || !trimmedPass) {
                    return { ok: false, error: 'Username and Password required' };
                }
                return {
                    ok: true,
                    credentials: {
                        username: trimmedUser,
                        password: trimmedPass,
                        mode,
                    },
                };
            }
            // fall through to other flows below if mode is unspecified
        }

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
