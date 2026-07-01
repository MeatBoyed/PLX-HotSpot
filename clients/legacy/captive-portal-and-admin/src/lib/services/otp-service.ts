/**
 * OTP Service
 * -----------------------------------------
 * Generates, sends, and verifies one-time passwords for phone verification.
 * OTPs are stored in plain text in the otp_verification table, scoped by SSID
 * so multiple captive portal instances sharing the same DB don't collide.
 *
 * Business rules:
 * - 4-digit numeric OTP
 * - 5-minute expiry
 * - Max 3 verification attempts per OTP
 * - 30-second resend cooldown per SSID+MSISDN
 */
import 'server-only';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/services/database-service';
import { ec1SmsService } from '@/lib/services/ec1-sms-service';

const OTP_EXPIRY_MS = 5 * 60 * 1000;   // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000;   // 30 seconds
const MAX_ATTEMPTS = 3;

type OtpResult = { success: true } | { success: false; error: string };

class OtpService {
    /**
     * Generate a 4-digit OTP, store it, and send it via SMS.
     */
    async generateAndSend(ssid: string, msisdn: string): Promise<OtpResult> {
        // Enforce resend cooldown
        const cooldownCutoff = new Date(Date.now() - RESEND_COOLDOWN_MS);
        const recent = await prisma.otp_verification.findFirst({
            where: {
                ssid,
                msisdn,
                created_at: { gte: cooldownCutoff },
            },
            orderBy: { created_at: 'desc' },
        });

        if (recent) {
            const waitSec = Math.ceil((recent.created_at.getTime() + RESEND_COOLDOWN_MS - Date.now()) / 1000);
            return { success: false, error: `Please wait ${waitSec}s before requesting a new code` };
        }

        // Generate cryptographically random 4-digit OTP (1000–9999)
        const otpCode = String(randomInt(1000, 10000)); // 10000 exclusive → 1000-9999

        // Send via EC1 SMS first — only store OTP if delivery succeeds
        const message = `${ssid} - Your WiFi verification code is: ${otpCode}`;
        try {
            await ec1SmsService.sendSms(msisdn, message);
        } catch (err) {
            console.error('[OTP] Failed to send SMS:', err);
            return { success: false, error: 'Failed to send verification code. Please try again.' };
        }

        // Store in DB (SMS succeeded)
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        await prisma.otp_verification.create({
            data: {
                ssid,
                msisdn,
                otp_code: otpCode,
                expires_at: expiresAt,
            },
        });

        console.log('[OTP] Code sent to', msisdn);
        return { success: true };
    }

    /**
     * Verify an OTP code for the given SSID + MSISDN.
     */
    async verify(ssid: string, msisdn: string, code: string): Promise<OtpResult> {
        const now = new Date();

        // Find the most recent non-expired, non-verified OTP for this ssid+msisdn
        const record = await prisma.otp_verification.findFirst({
            where: {
                ssid,
                msisdn,
                verified: false,
                expires_at: { gte: now },
            },
            orderBy: { created_at: 'desc' },
        });

        if (!record) {
            return { success: false, error: 'No active verification code. Please request a new one.' };
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            return { success: false, error: 'Too many attempts. Please request a new code.' };
        }

        // Compare codes
        if (code.trim() !== record.otp_code) {
            // Increment attempts
            await prisma.otp_verification.update({
                where: { id: record.id },
                data: { attempts: record.attempts + 1 },
            });
            const remaining = MAX_ATTEMPTS - (record.attempts + 1);
            return {
                success: false,
                error: remaining > 0
                    ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
                    : 'Too many attempts. Please request a new code.',
            };
        }

        // Mark as verified
        await prisma.otp_verification.update({
            where: { id: record.id },
            data: { verified: true },
        });

        console.log('[OTP] Verified for', msisdn);
        return { success: true };
    }
}

export const otpService = new OtpService();
