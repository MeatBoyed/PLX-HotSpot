/**
 * Auth Repository
 * Data access layer for authentication operations
 */

import {
    OtpRequest,
    OtpResponse,
    OtpVerify,
    SessionToken,
    FreeAuth,
    VoucherAuth,
} from '@/types/api.types';
import type { ApiClient } from '@/infrastructure/http';

/**
 * IAuthRepository - Port/Interface
 */
export interface IAuthRepository {
    /**
     * Request OTP code (SMS)
     */
    requestOtp(payload: OtpRequest): Promise<OtpResponse>;

    /**
     * Verify OTP code
     */
    verifyOtp(payload: OtpVerify): Promise<SessionToken>;

    /**
     * Activate free tier session
     */
    activateFree(payload: FreeAuth): Promise<SessionToken>;

    /**
     * Activate voucher session
     */
    activateVoucher(payload: VoucherAuth): Promise<SessionToken>;
}

/**
 * AuthRepository - Implementation
 */
export class AuthRepository implements IAuthRepository {
    constructor(private apiClient: ApiClient) { }

    async requestOtp(payload: OtpRequest): Promise<OtpResponse> {
        return this.apiClient.post<OtpResponse>('/auth/sms/request', payload, {
            ssid: payload.ssid,
        });
    }

    async verifyOtp(payload: OtpVerify): Promise<SessionToken> {
        return this.apiClient.post<SessionToken>('/auth/sms/verify', payload, {
            ssid: payload.ssid,
        });
    }

    async activateFree(payload: FreeAuth): Promise<SessionToken> {
        return this.apiClient.post<SessionToken>('/auth/free', payload, {
            ssid: payload.ssid,
        });
    }

    async activateVoucher(payload: VoucherAuth): Promise<SessionToken> {
        return this.apiClient.post<SessionToken>('/auth/voucher', payload, {
            ssid: payload.ssid,
        });
    }
}
