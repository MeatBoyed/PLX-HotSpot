/**
 * PermanentUserService
 * -----------------------------------------
 * Creates permanent users in RadiusDesk via the API.
 * Uses the global RadiusDesk configuration from environment variables.
 */
import 'server-only';
import { env } from '@/env';
import type { Package } from '@/lib/services/package-service';

interface CreatePermanentUserInput {
    username: string; // Can be email or unique identifier
    password: string;
    pkg: Package; // carries RadiusDesk identifiers (realm, profile)
    msisdn?: string; // Optional: stored in extra_value field
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
}

export interface PermanentUserRecord {
    username: string;
    password: string;
    realmId: string;
    profileId: string;
    active: boolean;
    createdAt: Date;
}

class PermanentUserService {
    private getRadiusDeskConfig(pkg: Package) {
        const baseUrl = env.MIKROTIK_RADIUS_DESK_BASE_URL;
        const token = env.RADIUSDESK_TOKEN;
        const realmId = env.RADIUSDESK_REALM_ID;
        const cloudId = env.RADIUSDESK_CLOUD_ID;
        const profileId = env.RADIUSDESK_PROFILE_ID;

        const missing = [
            !baseUrl && 'RADIUSDESK_BASE_URL',
            !token && 'RADIUSDESK_TOKEN',
            !realmId && 'RADIUSDESK_REALM_ID',
            !cloudId && 'RADIUSDESK_CLOUD_ID',
            !profileId && 'RADIUSDESK_PROFILE_ID',
        ].filter(Boolean) as string[];

        if (missing.length) {
            throw new Error(`PermanentUserService: Missing config: ${missing.join(', ')}`);
        }

        return {
            baseUrl: String(baseUrl),
            token: String(token),
            realmId: String(realmId),
            cloudId: String(cloudId),
            profileId: String(profileId),
        };
    }

    async createPermanentUser(input: CreatePermanentUserInput): Promise<PermanentUserRecord> {
        const { username, password, pkg, msisdn, name, surname, email, phone } = input;

        // Get RadiusDesk configuration
        const config = this.getRadiusDeskConfig(pkg);
        const { baseUrl, token, realmId, cloudId, profileId } = config;

        // Build API URL
        const url = new URL('/cake4/rd_cake/permanent-users/add.json', baseUrl.replace(/\/$/, ''));

        // Build request payload (minimum required fields)
        const payload: Record<string, string | number> = {
            user_id: 0, // 0 = owner of token becomes owner
            username,
            password,
            realm_id: realmId,
            profile_id: profileId,
            cloud_id: cloudId,
            token,
        };

        // Add optional fields if provided
        if (name) payload.name = name;
        if (surname) payload.surname = surname;
        if (email) payload.email = email;
        if (phone) payload.phone = phone;
        if (msisdn) {
            payload.extra_name = 'msisdn';
            payload.extra_value = msisdn;
        }

        console.log('[PERMANENT_USER:CREATE] Calling RadiusDesk API:', url.toString());
        console.log('[PERMANENT_USER:CREATE] Payload:', { ...payload, token: '[REDACTED]', password: '[REDACTED]' });

        // Make API request
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        let json: any;

        try {
            json = JSON.parse(text);
        } catch (err) {
            console.error('[PERMANENT_USER:CREATE] Failed to parse response:', text);
            throw new Error(`RadiusDesk returned invalid JSON: ${text.slice(0, 200)}`);
        }

        if (!res.ok || !json.success) {
            console.error('[PERMANENT_USER:CREATE] Error response:', json);
            throw new Error(`RadiusDesk error ${res.status}: ${JSON.stringify(json)}`);
        }

        // Extract user data from response
        const userData = json.data || {};
        const record: PermanentUserRecord = {
            username: userData.username || username,
            password, // Keep the original password (response might redact it)
            realmId: String(userData.realm_id || realmId),
            profileId: String(userData.profile_id || profileId),
            active: userData.active === 1 || userData.active === true,
            createdAt: new Date(),
        };

        console.log('[PERMANENT_USER:CREATED]', {
            username: record.username,
            realmId: record.realmId,
            profileId: record.profileId,
            active: record.active,
        });

        return record;
    }

    /**
     * Helper: Generate a unique username from msisdn
     * Example: 27820000000 -> user27820000000 or 27820000000@realm
     */
    generateUsername(msisdn: string, prefix: string = 'user'): string {
        // Remove any non-numeric characters
        const clean = msisdn.replace(/\D/g, '');
        return `${prefix}${clean}`;
    }

    /**
     * Helper: Generate a random password
     */
    generatePassword(length: number = 12): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}

export const permanentUserService = new PermanentUserService();

// Usage example:
// const user = await permanentUserService.createPermanentUser({
//   username: 'testuser@demo1',
//   password: 'securepass123',
//   pkg: packageData,
//   msisdn: '27820000000',
//   name: 'John',
//   surname: 'Doe',
//   email: 'john@example.com'
// });
