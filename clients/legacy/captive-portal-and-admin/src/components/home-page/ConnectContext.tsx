"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthMode, AuthService, AuthCredentials } from '@/lib/services/auth-service';

// State machine types
type ConnectState = 'idle' | 'ad' | 'ready';

interface ConnectContextValue {
    state: ConnectState;
    showAd: boolean;
    credentials?: AuthCredentials;
    pendingVoucher?: string;
    connect: (voucherCode?: string, credentials?: AuthCredentials) => ConnectAttemptResult;
    onAdComplete: () => void;
    reset: () => void;
}

interface ConnectProviderProps {
    children: ReactNode;
    enabledAuth: AuthMode[];
    adGateEnabled?: boolean;
    authService?: AuthService;
}

interface ConnectAttemptPending { pending: true }
interface ConnectAttemptReady { pending: false; credentials: AuthCredentials }
interface ConnectAttemptError { pending: false; error: string }
export type ConnectAttemptResult = ConnectAttemptPending | ConnectAttemptReady | ConnectAttemptError;

const ConnectContext = createContext<ConnectContextValue | undefined>(undefined);

export function useConnect() {
    const ctx = useContext(ConnectContext);
    if (!ctx) throw new Error('useConnect must be used within ConnectProvider');
    return ctx;
}

export function ConnectProvider({ children, enabledAuth, adGateEnabled = false, authService }: ConnectProviderProps) {
    const svc = authService || new AuthService();
    const [state, setState] = useState<ConnectState>('idle');
    const [showAd, setShowAd] = useState(false);
    const [credentials, setCredentials] = useState<AuthCredentials | undefined>(undefined);
    const [pendingVoucher, setPendingVoucher] = useState<string | undefined>(undefined);
    const [gatedOnce, setGatedOnce] = useState(false);

    const connect = (voucherCode?: string | undefined, credentials?: AuthCredentials): ConnectAttemptResult => {
        // Reset previous credentials if any
        setCredentials(undefined);
        setPendingVoucher(voucherCode);

        const needsGate = adGateEnabled && !gatedOnce;
        if (needsGate) {
            setShowAd(true);
            setState('ad');
            return { pending: true };
        }

        const result = svc.buildCredentials({ voucherCode, username: credentials?.username, password: credentials?.password, enabledAuth });
        if (!result.ok) return { pending: false, error: result.error };
        setCredentials(result.credentials);
        setState('ready');
        return { pending: false, credentials: result.credentials };
    };

    const onAdComplete = () => {
        if (state !== 'ad') return;
        setShowAd(false);
        setGatedOnce(true);
        const result = svc.buildCredentials({ voucherCode: pendingVoucher, enabledAuth });
        if (!result.ok) {
            setState('idle');
            return; // consumer will retry connect to see error
        }
        setCredentials(result.credentials);
        setState('ready');
    };

    const reset = () => {
        setCredentials(undefined);
        setPendingVoucher(undefined);
        setShowAd(false);
        setState('idle');
    };

    return (
        <ConnectContext.Provider value={{ state, showAd, credentials, pendingVoucher, connect, onAdComplete, reset }}>
            {children}
        </ConnectContext.Provider>
    );
}

