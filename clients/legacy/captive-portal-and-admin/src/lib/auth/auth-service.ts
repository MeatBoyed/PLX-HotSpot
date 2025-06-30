"use server";

import { getMikroTikDataFromCookie } from '@/lib/mikrotik/mikrotik-lib';
import { loginToHotspot, getUserSession, checkUserUsage } from '@/lib/mikrotik/mikrotik-service';
import { MikroTikData, LoginFormState, StatusResponse, RadiusDeskUsageResponse } from '@/lib/mikrotik/mikrotik-types';
import { redirect } from 'next/navigation';

export interface AuthState {
    isAuthenticated: boolean;
    mikrotikData: MikroTikData | null;
    userSession: StatusResponse['data'] | null;
    userUsage: RadiusDeskUsageResponse | null;
    error?: string;
}

export async function getAuthState(): Promise<AuthState> {
    try {
        // Get mikrotik data from cookie
        const mikrotikData = await getMikroTikDataFromCookie();

        if (!mikrotikData) {
            return {
                isAuthenticated: false,
                mikrotikData: null,
                userSession: null,
                userUsage: null,
                error: 'No MikroTik data found'
            };
        }

        // Check current session status
        const sessionResult = await getUserSession(mikrotikData);
        const usageResult = await checkUserUsage(mikrotikData);

        return {
            isAuthenticated: sessionResult.success && !!sessionResult.data,
            mikrotikData,
            userSession: sessionResult.data || null,
            userUsage: usageResult.success ? usageResult : null,
            error: sessionResult.success ? undefined : sessionResult.message
        };
    } catch (error) {
        console.error('Error getting auth state:', error);
        return {
            isAuthenticated: false,
            mikrotikData: null,
            userSession: null,
            userUsage: null,
            error: 'Failed to get authentication state'
        };
    }
}

export async function authenticateUser(voucherCode?: string): Promise<LoginFormState> {
    try {
        const mikrotikData = await getMikroTikDataFromCookie();

        if (!mikrotikData) {
            return { success: false, message: 'No MikroTik data found' };
        }

        console.log('Attempting authentication with MikroTik data:', mikrotikData);

        // Perform login
        const loginResult = await loginToHotspot(mikrotikData, voucherCode);

        if (!loginResult.success) {
            console.error('Login failed:', loginResult.message);

            // Provide more specific error messages based on common issues
            if (loginResult.message?.includes('RADIUS server')) {
                return {
                    success: false,
                    message: 'Network authentication server is unavailable. Please try again later or contact support.'
                };
            } else if (loginResult.message?.includes('invalid') || loginResult.message?.includes('wrong')) {
                return {
                    success: false,
                    message: 'Invalid credentials. Please check your voucher code and try again.'
                };
            }

            return loginResult;
        }

        console.log('Login successful, verifying session...');

        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify the session was actually created
        const sessionVerification = await getUserSession(mikrotikData);

        if (!sessionVerification.success || !sessionVerification.data) {
            console.error('Session verification failed:', sessionVerification.message);
            return {
                success: false,
                message: 'Login appeared successful but session not established. Please try again.'
            };
        }

        console.log('Session verified successfully:', sessionVerification.data);

        // Additional connectivity test - try to reach an external endpoint
        try {
            const connectivityTest = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });

            if (!connectivityTest.ok) {
                console.warn('Internet connectivity test failed, but session exists');
            } else {
                console.log('Internet connectivity confirmed');
            }
        } catch (connectivityError) {
            console.warn('Connectivity test failed:', connectivityError);
            // Don't fail auth if connectivity test fails, session might still be valid
        }

        return { success: true, message: 'Successfully authenticated' };
    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'Authentication failed' };
    }
}

export async function requireAuth(): Promise<AuthState> {
    const authState = await getAuthState();

    if (!authState.mikrotikData) {
        redirect('https://pluxnet.co.za');
    }

    return authState;
}

export async function requireAuthenticated(): Promise<AuthState> {
    const authState = await requireAuth();

    if (!authState.isAuthenticated) {
        redirect('/');
    }

    return authState;
}
