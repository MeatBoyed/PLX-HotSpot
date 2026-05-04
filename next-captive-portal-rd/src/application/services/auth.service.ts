/**
 * Auth Service
 * Business logic for authentication operations
 */

import {
    OtpRequest,
    OtpResponse,
    OtpVerify,
    SessionToken,
    FreeAuth,
    VoucherAuth,
} from '@/types/api.types';
import { AuthRepository } from '../repositories/auth.repo';
import { apiClient } from '@/infrastructure/http';

/**
 * Service - Stateless, orchestrates repository
 */
export class AuthService {
    private repository: AuthRepository;

    constructor() {
        this.repository = new AuthRepository(apiClient);
    }

    /**
     * Request OTP code
     * Server action only
     */
    async requestOtp(payload: OtpRequest): Promise<OtpResponse> {
        if (!payload.phoneNumber || !payload.ssid) {
            throw new Error('Phone number and SSID are required');
        }

        return this.repository.requestOtp(payload);
    }

    /**
     * Verify OTP code
     * Server action only
     */
    async verifyOtp(payload: OtpVerify): Promise<SessionToken> {
        if (!payload.phoneNumber || !payload.code || !payload.ssid) {
            throw new Error('Phone number, code, and SSID are required');
        }

        return this.repository.verifyOtp(payload);
    }

    /**
     * Activate free tier
     * Server action only
     */
    async activateFree(payload: FreeAuth): Promise<SessionToken> {
        if (!payload.ssid) {
            throw new Error('SSID is required');
        }

        return this.repository.activateFree(payload);
    }

    /**
     * Activate voucher
     * Server action only
     */
    async activateVoucher(payload: VoucherAuth): Promise<SessionToken> {
        if (!payload.code || !payload.ssid) {
            throw new Error('Voucher code and SSID are required');
        }

        return this.repository.activateVoucher(payload);
    }
}

/**
 * Singleton instance
 */
export const authService = new AuthService();
