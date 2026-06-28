import { NextRequest, NextResponse } from 'next/server';
import { permanentUserService } from '@/features/purchasing/permanent-user-service';
import { packageService } from '@/lib/services/package-service';
import { env } from '@/env';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate inputs
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get the default package for the current SSID
        const ssid = env.NEXT_PUBLIC_SSID;
        const packages = await packageService.list(ssid);

        if (!packages || packages.length === 0) {
            console.error('[REGISTER] No packages found for SSID:', ssid);
            return NextResponse.json(
                { success: false, error: 'Service configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        // Use the first package
        const pkg = packages[0];

        // Create permanent user via RadiusDesk
        const user = await permanentUserService.createPermanentUser({
            username: email,
            password: password,
            pkg: pkg,
            email: email,
        });

        console.log('[REGISTER] User created successfully:', user.username);

        return NextResponse.json({
            success: true,
            username: user.username,
        });
    } catch (error) {
        console.error('[REGISTER] Error creating permanent user:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
            return NextResponse.json(
                { success: false, error: 'This email is already registered. Please login instead.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create account. Please try again or contact support.' },
            { status: 500 }
        );
    }
}
